import { Pool } from "pg"
import { CrontabItem, TaskIndexModule, WorkerContext } from "types"
import { run, Runner, WorkerEventMap, WorkerEvents } from "graphile-worker"
import EventEmitter from "events"
import { startHealthServer } from "./health-server"
import { testDatabaseConnection } from "./test-database-connection"
import { getKyselyDatabaseInstance } from "./get-kysely-db"
import { WorkerState, Logger } from "../types"
import * as ev_handler from "./worker-event-handler"
import { initSentry } from "./init-sentry"
import ms from "ms"
import { getDefaultLogger } from "./utils/get-default-logger"
import { getRunnerArgs } from "./get-runner-args"

interface StartWorkerParams {
  pool: Pool
  health_server_port: number
  crontab_config?: readonly CrontabItem<any>[]
  tasks: TaskIndexModule
  exit_if_dead?: boolean
  logger?: Logger
  build_time?: string | Date | number
  git_commit_sha?: string
  report_job_errors_to_sentry?: boolean
}

export const startWorker = async (opts: StartWorkerParams) => {
  if (opts.report_job_errors_to_sentry) initSentry()
  if (!opts.logger) opts.logger = getDefaultLogger()

  const { logger, pool, exit_if_dead = false } = opts

  const db = getKyselyDatabaseInstance(pool)

  const worker_state: WorkerState = {
    last_active_worker_event_at: Date.now(),
    dead: false,
  }

  const health_server = startHealthServer({
    worker_state,
    port: opts.health_server_port,
  })

  await testDatabaseConnection({ pool, logger, exit_if_dead })

  const worker_events = new EventEmitter()

  const worker_context: WorkerContext = {
    db,
    pool,
    health_server,
    logger,
    runner: null as any, // populate as soon as runner starts
    worker_state,
    config: {
      report_job_errors_to_sentry: opts.report_job_errors_to_sentry ?? false,
      exit_if_dead,
    },
  }

  const handleWorkerEventWith = (
    worker_event: keyof WorkerEventMap,
    handlerName: keyof typeof ev_handler
  ) => {
    worker_events.on(worker_event, (ev: any) => {
      logger.debug(`Handling worker event "${worker_event}"`)
      return ev_handler[handlerName](ev, worker_context).catch((e) => {
        logger.error(
          `STOPPING RUNNER: Error handling worker event "${worker_event}" with "${handlerName}"`,
          { error: e }
        )
        runner.stop().catch((e) => {
          logger.error(`Error stopping runner: ${e.toString()}`)
        })
      })
    })
  }
  const logUnhandledWorkerEvent = (worker_event: keyof WorkerEventMap) => {
    worker_events.on(worker_event, (ev: any) => {
      logger.debug(`Unhandled Worker Event "${worker_event}"`, ev)
    })
  }

  handleWorkerEventWith("worker:create", "onWorkerCreated")
  handleWorkerEventWith("worker:getJob:empty", "onActiveWorkerEvent")
  handleWorkerEventWith("job:start", "onJobStart")
  handleWorkerEventWith("job:complete", "onActiveWorkerEvent")
  handleWorkerEventWith("worker:fatalError", "onInactiveWorkerEvent")
  handleWorkerEventWith("worker:stop", "onInactiveWorkerEvent")
  handleWorkerEventWith("job:error", "onJobError")
  handleWorkerEventWith("worker:getJob:error", "onFailedToGetJob")

  logUnhandledWorkerEvent("pool:listen:error")

  process.on("SIGINT", (ev) => ev_handler.onSigint(ev, worker_context))

  const check_alive_interval = setInterval(
    () => ev_handler.onHeartbeatInterval({}, worker_context),
    10_000
  )

  // Kill workers after MAX_WORKER_RUN_TIME, this can be done to prevent
  // KnexJSConnectionTimeout issues from bad pool cleanup
  if (process.env.MAX_WORKER_RUN_TIME) {
    const max_worker_run_time = ms(process.env.MAX_WORKER_RUN_TIME)
    const random_offset = (Math.random() - 0.5) * max_worker_run_time
    setTimeout(
      () => ev_handler.onWorkerMaxRuntime({ random_offset }, worker_context),
      max_worker_run_time
    )
  }

  const runner = await run({
    ...getRunnerArgs({
      pool,
      crontab_config: opts.crontab_config ?? [],
      tasks: opts.tasks,
      logger,
    }),
    events: worker_events,
  })
  worker_context.runner = runner

  // // MONKEY-PATCH runner stop function to also stop server
  ;(runner as any).og_runner_stop = runner.stop
  runner.stop = async () => {
    health_server.stop()
    clearInterval(check_alive_interval)
    return (runner as any).og_runner_stop()
  }

  return runner
}

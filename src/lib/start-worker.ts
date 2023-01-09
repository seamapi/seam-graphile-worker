import { Pool } from "pg"
import { TaskIndexModule, WorkerContext } from "types"
import http from "http"
import delay from "delay"
import ms from "ms"
import EventEmitter from "events"
import { Kysely, PostgresDialect } from "kysely"
import { startHealthServer } from "./health-server"
import { testDatabaseConnection } from "./test-database-connection"
import { getKyselyDatabaseInstance } from "./get-kysely-db"
import { WorkerState, Logger } from "../types"
import * as workerEventHandlers from "./worker-event-handler"

interface StartWorkerParams {
  pool: Pool
  health_server_port: number
  tasks: TaskIndexModule
  exit_if_dead?: boolean
  logger?: Logger
  build_time?: string | Date
  git_commit_sha?: string
}

export const startWorker = async (opts: StartWorkerParams) => {
  if (!opts.logger) {
    opts.logger = {
      log: console.log,
      debug: console.log,
      info: console.log,
      error: console.log,
    }
  }

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
  }

  // const onInactiveWorkerEvent = async () => {
  //   worker_dead = true
  //   await db
  //     .update(
  //       "devops.worker_heartbeat",
  //       {
  //         was_accepting_jobs: false,
  //         last_heartbeat_at: new Date(),
  //       },
  //       { graphile_worker_id }
  //     )
  //     .run(pool!)
  // }

  // const reportToSentry = ({
  //   worker,
  //   job,
  //   error,
  // }: WorkerEventMap["job:error"]) => {
  //   reportError(error, {
  //     extra: {
  //       job,
  //       job_admin_url: `https://connect.getseam.com/admin/view_job?id=${job.id}`,
  //       worker_id: worker.workerId,
  //     },
  //   })
  // }

  const handleWith = (handler) => (ev) => handler(ev, worker_context)

  worker_events.on("worker:create", (ev) =>
    workerEventHandlers.onWorkerCreated(ev, worker_context)
  )
  worker_events.on("worker:getJob:empty", (ev) =>
    workerEventHandlers.onActiveWorkerEvent(ev, worker_context)
  )

  worker_events.on("job:start", (ev) =>
    workerEventHandlers.onJobStart(ev, worker_context)
  )
  worker_events.on("job:complete", (ev) =>
    workerEventHandlers.onActiveWorkerEvent(ev, worker_context)
  )

  worker_events.on("worker:fatalError", onInactiveWorkerEvent)
  worker_events.on("worker:stop", onInactiveWorkerEvent)
  worker_events.on("job:error", reportToSentry)

  const runner = await run({
    ...getRunnerArgs({ pool, additionalTasks }),
    events: worker_events,
  })
  worker_context.runner = runner

  // process.on("SIGINT", async () => {
  //   logger.info("SIGINT received, stopping worker...")
  //   // eslint-disable-next-line @typescript-eslint/no-empty-function
  //   await runner.stop().catch((_error) => {})
  //   logger.info("Worker stopped, telling database we're not accepting jobs...")
  //   await db
  //     .update(
  //       "devops.worker_heartbeat",
  //       { was_accepting_jobs: false, last_heartbeat_at: new Date() },
  //       { graphile_worker_id }
  //     )
  //     .run(pool!)
  //   process.exit(0)
  // })

  // const check_alive_interval = setInterval(async () => {
  //   await db
  //     .update(
  //       "devops.worker_heartbeat",
  //       { last_heartbeat_at: new Date(), was_accepting_jobs: !worker_dead },
  //       { graphile_worker_id }
  //     )
  //     .run(pool!)

  //   if (Date.now() - last_active_worker_event_at > ms("5m")) {
  //     worker_dead = true
  //   }
  //   // In production, kill the worker so it can automatically restart
  //   if (exit_if_dead && worker_dead) {
  //     // eslint-disable-next-line unicorn/no-process-exit
  //     process.exit(1)
  //   }
  // }, 10_000)

  // // Kill workers after MAX_WORKER_RUN_TIME, this can be done to prevent
  // // KnexJSConnectionTimeout issues from bad pool cleanup
  // if (process.env.MAX_WORKER_RUN_TIME) {
  //   const max_worker_run_time = ms(process.env.MAX_WORKER_RUN_TIME)
  //   const random_offset = (Math.random() - 0.5) * max_worker_run_time
  //   if (max_worker_run_time) {
  //     setTimeout(async () => {
  //       console.log(
  //         `Stopping worker because it's been running for longer than MAX_WORKER_RUN_TIME (${
  //           process.env.MAX_WORKER_RUN_TIME
  //         }) plus a random offset of ${(random_offset / 1000 / 60).toFixed(
  //           2
  //         )} min. Worker is given 5 minutes to shut down.`
  //       )
  //       await runner.stop()
  //     }, max_worker_run_time)
  //     setTimeout(() => {
  //       console.log("Killing worker process...")
  //       // eslint-disable-next-line unicorn/no-process-exit
  //       process.exit(0)
  //     }, max_worker_run_time + ms("5m"))
  //   }
  // }

  // // MONKEY-PATCH runner stop function to also stop server
  // ;(runner as any).og_runner_stop = runner.stop
  // runner.stop = async () => {
  //   health_server.stop()
  //   clearInterval(check_alive_interval)
  //   return (runner as any).og_runner_stop()
  // }

  // return runner
}

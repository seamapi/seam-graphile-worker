import { Pool } from "pg"
import { TaskIndexModule } from "types"
import http from "http"
import delay from "delay"
import ms from "ms"
import EventEmitter from "events"

interface Logger {
  log: (...args: any[]) => void
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  error: (...args: any[]) => void
}

interface StartWorkerParams {
  pool: Pool
  health_server_port: number
  tasks: TaskIndexModule
  exit_if_dead?: boolean
  logger?: Logger
  build_time: string | Date
  git_commit_sha: string
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

  const { logger, pool } = opts

  // Start a worker health server
  let last_active_worker_event_at: number = Date.now()
  let worker_dead = false
  const worker_health_server = http.createServer(async (req, res) => {
    if (worker_dead) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ worker_alive: false }))
      return
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ worker_alive: true }))
  })
  worker_health_server.listen(opts.health_server_port)

  // Test Database Connection
  logger.debug("Testing database connection with test query...")
  try {
    await pool.query("SELECT 1")
    logger.debug("Database connection working (test query successful)")
  } catch (error: any) {
    // Stagger killing worker in case database is being overloading by workers
    // trying to connect
    logger.debug(
      `Database connection failed (test query failed): ${error.toString()}`
    )
    const random_backoff_ms = Math.round(Math.random() * 20_000 + 10_000)
    const backoff_string = (random_backoff_ms / 1000).toFixed(2) + "s"
    logger.debug(`Waiting ${backoff_string} then exiting process...`)
    await delay(ms(backoff_string))
    // eslint-disable-next-line unicorn/no-process-exit
    if (opts.exit_if_dead) return process.exit(1)
    throw new Error("Worker was not able to connect to database")
  }

  const worker_events = new EventEmitter()

  let graphile_worker_id: string
  const onWorkerCreated = async ({ worker }: any) => {
    graphile_worker_id = worker.workerId
    await db
      .upsert(
        "devops.worker_heartbeat",
        {
          was_accepting_jobs: true,
          graphile_worker_id,
          last_heartbeat_at: new Date(),
          version_build_time: opts.build_time
            ? new Date(opts.build_time)
            : null,
          version_commit_hash: opts.git_commit_sha
            ? buildInfo.GIT_COMMIT_SHA
            : null,
        },
        ["graphile_worker_id"]
      )
      .run(pool!)
  }

  const onActiveWorkerEvent = async () => {
    last_active_worker_event_at = Date.now()
  }

  const onInactiveWorkerEvent = async () => {
    worker_dead = true
    await db
      .update(
        "devops.worker_heartbeat",
        {
          was_accepting_jobs: false,
          last_heartbeat_at: new Date(),
        },
        { graphile_worker_id }
      )
      .run(pool!)
  }

  const reportToSentry = ({
    worker,
    job,
    error,
  }: WorkerEventMap["job:error"]) => {
    reportError(error, {
      extra: {
        job,
        job_admin_url: `https://connect.getseam.com/admin/view_job?id=${job.id}`,
        worker_id: worker.workerId,
      },
    })
  }

  worker_events.on("worker:create", onWorkerCreated)
  worker_events.on("worker:getJob:empty", onActiveWorkerEvent)
  worker_events.on("job:start", async () => {
    await db
      .update(
        "devops.worker_heartbeat",
        { last_heartbeat_at: new Date(), last_job_accepted_at: new Date() },
        { graphile_worker_id }
      )
      .run(pool!)
  })
  worker_events.on("job:start", onActiveWorkerEvent)
  worker_events.on("job:complete", onActiveWorkerEvent)
  worker_events.on("worker:fatalError", onInactiveWorkerEvent)
  worker_events.on("worker:stop", onInactiveWorkerEvent)
  worker_events.on("job:error", reportToSentry)

  const runner = await run({
    ...getRunnerArgs({ pool, additionalTasks }),
    events: worker_events,
  })

  process.on("SIGINT", async () => {
    logger.info("SIGINT received, stopping worker...")
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await runner.stop().catch((_error) => {})
    logger.info("Worker stopped, telling database we're not accepting jobs...")
    await db
      .update(
        "devops.worker_heartbeat",
        { was_accepting_jobs: false, last_heartbeat_at: new Date() },
        { graphile_worker_id }
      )
      .run(pool!)
    process.exit(0)
  })

  // Add startup tasks if necessary
  await Promise.all(
    crontab_config
      .filter((c) => c.run_on_startup_if_never_run)
      .map(async (config) => {
        const has_task_run_once = Boolean(
          await db
            .selectOne(
              "diagnostics.job_log",
              { task_identifier: config.task },
              { columns: ["job_log_id"] }
            )
            .run(pool!)
        )

        if (!has_task_run_once) {
          logger.info(
            `Task ${config.task} hasn't run before, adding to queue...`
          )
          await runner.addJob(config.task, config.payload, config.options)
        }
      })
  )

  const check_alive_interval = setInterval(async () => {
    await db
      .update(
        "devops.worker_heartbeat",
        { last_heartbeat_at: new Date(), was_accepting_jobs: !worker_dead },
        { graphile_worker_id }
      )
      .run(pool!)

    if (Date.now() - last_active_worker_event_at > ms("5m")) {
      worker_dead = true
    }
    // In production, kill the worker so it can automatically restart
    if (exit_if_dead && worker_dead) {
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1)
    }
  }, 10_000)

  // Kill workers after MAX_WORKER_RUN_TIME, this can be done to prevent
  // KnexJSConnectionTimeout issues from bad pool cleanup
  if (process.env.MAX_WORKER_RUN_TIME) {
    const max_worker_run_time = ms(process.env.MAX_WORKER_RUN_TIME)
    const random_offset = (Math.random() - 0.5) * max_worker_run_time
    if (max_worker_run_time) {
      setTimeout(async () => {
        console.log(
          `Stopping worker because it's been running for longer than MAX_WORKER_RUN_TIME (${
            process.env.MAX_WORKER_RUN_TIME
          }) plus a random offset of ${(random_offset / 1000 / 60).toFixed(
            2
          )} min. Worker is given 5 minutes to shut down.`
        )
        await runner.stop()
      }, max_worker_run_time)
      setTimeout(() => {
        console.log("Killing worker process...")
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(0)
      }, max_worker_run_time + ms("5m"))
    }
  }

  // MONKEY-PATCH runner stop function to also stop server
  ;(runner as any).og_runner_stop = runner.stop
  runner.stop = async () => {
    worker_health_server.close()
    clearInterval(check_alive_interval)
    return (runner as any).og_runner_stop()
  }

  return runner
}

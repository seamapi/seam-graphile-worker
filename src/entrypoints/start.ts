import { getConnectionStringFromEnv } from "pg-connection-from-env"
import { startWorker } from "lib/start-worker"
import { Pool } from "pg"
import { UnableToConnectToDatabaseError } from "lib/errors"
import path from "path"
import { migrate } from "lib/migrate"
import { SeamGraphileWorkerConfig } from "types"

interface Opts {
  migrate?: boolean
  configPath?: string
  healthServerPort?: number
  exitIfDead?: boolean
  reportJobErrorsToSentry?: boolean
}

export const start = async (argv: Opts = {}) => {
  const connectionString = getConnectionStringFromEnv()
  const pool = new Pool({ connectionString })

  if (!argv.healthServerPort) {
    throw new Error("--health-server-port is required")
  }

  // Check database connection
  try {
    await pool.query("SELECT 1")
  } catch (err: any) {
    throw new UnableToConnectToDatabaseError()
  }

  if (argv.migrate ?? true) {
    await migrate(connectionString)
  }

  require("esbuild-register")

  // Get tasks
  const config: SeamGraphileWorkerConfig<any> = (
    await require(argv.configPath?.startsWith("/")
      ? argv.configPath
      : path.join(
          process.cwd(),
          argv.configPath || "./seam-graphile-worker.config.ts"
        ))
  ).default

  await startWorker({
    pool,
    build_time: config.build_time,
    git_commit_sha: config.git_commit_sha,
    logger: config.logger,
    exit_if_dead: Boolean(argv.exitIfDead),
    report_job_errors_to_sentry:
      argv.reportJobErrorsToSentry ??
      config.report_job_errors_to_sentry ??
      false,
    health_server_port: argv.healthServerPort,
    tasks: config.tasks,
    crontab_config: config.crontabs,
  })
}

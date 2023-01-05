import { getConnectionStringFromEnv } from "pg-connection-from-env"
import { startWorker } from "lib/start-worker"
import { Pool } from "pg"
import { UnableToConnectToDatabaseError } from "lib/errors"
import path from "path"

interface Opts {
  configPath?: string
  healthServerPort?: number
}

export const start = async (argv: Opts = {}) => {
  const pool = new Pool({
    connectionString: getConnectionStringFromEnv(),
  })

  // Check database connection
  try {
    await pool.query("SELECT 1")
  } catch (err: any) {
    throw new UnableToConnectToDatabaseError()
  }

  require("esbuild-register")

  // Get tasks
  const config = (
    await require(argv.configPath?.startsWith("/")
      ? argv.configPath
      : path.join(
          process.cwd(),
          argv.configPath || "./seam-graphile-worker.config.ts"
        ))
  ).default

  await startWorker({
    pool,
    health_server_port: argv.healthServerPort || 3051,
    tasks: config.tasks,
  })
}

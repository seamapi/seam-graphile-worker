import { getConnectionStringFromEnv } from "pg-connection-from-env"
import { startWorker } from "lib/start-worker"
import { Pool } from "pg"
import { UnableToConnectToDatabaseError } from "lib/errors"

export const start = async () => {
  const pool = new Pool({
    connectionString: getConnectionStringFromEnv(),
  })

  // Check database connection
  try {
    await pool.query("SELECT 1")
  } catch (err: any) {
    throw new UnableToConnectToDatabaseError()
  }

  startWorker({
    pool,
  })
}

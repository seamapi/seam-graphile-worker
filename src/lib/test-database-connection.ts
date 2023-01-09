import { ms } from "ms"
import delay from "delay"
import { Pool } from "pg"
import { Logger } from "./start-worker"

interface Opts {
  pool: Pool
  logger: Logger
  exit_if_dead: boolean
}

export const testDatabaseConnection = async ({
  pool,
  logger,
  exit_if_dead,
}: Opts) => {
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
    if (exit_if_dead) return process.exit(1)
    throw new Error("Worker was not able to connect to database")
  }
}

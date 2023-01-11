import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "../fixtures/get-test-database"
import config from "../example-seam-graphile-worker.config"
import delay from "delay"
import ms from "ms"
import { getDefaultLogger } from "lib/utils/get-default-logger"
import { getKyselyDatabaseInstance } from "lib/get-kysely-db"

test("database has issue while executing", async (t) => {
  let { connectionString, pool } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString

  const logged_lines: string[] = []
  config.logger.on("log", (level, ...args) => {
    logged_lines.push(`${level}: ${args.join(" ")}`)
  })

  await start({
    configPath: "./tests/example-seam-graphile-worker.config.ts",
  })

  await delay(ms("1s"))

  // clear array
  logged_lines.length = 0

  // make the graphile_worker schema broken
  await pool.query(`DROP SCHEMA graphile_worker CASCADE`)

  await delay(ms("1s"))

  t.truthy(
    logged_lines.some((line) =>
      line.includes(
        `Failed to get job: error: relation "graphile_worker.jobs" does not exist`
      )
    )
  )

  const db = await getKyselyDatabaseInstance(pool)

  const heartbeat = await db
    .selectFrom("seam_graphile_worker.worker_heartbeat")
    .selectAll()
    .executeTakeFirstOrThrow()

  t.is(heartbeat.was_accepting_jobs, false)
})

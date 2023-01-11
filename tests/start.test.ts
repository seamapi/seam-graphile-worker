import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "./fixtures/get-test-database"
import config from "./example-seam-graphile-worker.config"
import getPort from "@ava/get-port"

test("should start graphile worker", async (t) => {
  config.health_server_port = await getPort()
  const { connectionString } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString

  const logged_items: Array<{ level: string; line: string; args: any[] }> = []
  config.logger.on("log", (level, ...args) => {
    logged_items.push({ level, args, line: `${level}: ${args.join(" ")}` })
  })

  await start({
    configPath: "./tests/example-seam-graphile-worker.config.ts",
  })

  t.truthy(
    logged_items.some((item) =>
      item.line.includes("Database connection working")
    )
  )
  t.is(logged_items.filter((item) => item.line.includes("Spawned")).length, 1)
})

import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "./fixtures/get-test-database"
import config from "./example-seam-graphile-worker.config"
import axios from "axios"

test("should start graphile worker health server", async (t) => {
  const { connectionString } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString

  const logged_items: Array<{ level: string; line: string; args: any[] }> = []
  config.logger.on("log", (level, ...args) => {
    logged_items.push({ level, args, line: `${level}: ${args.join(" ")}` })
  })

  await start({
    configPath: "./tests/example-seam-graphile-worker.config.ts",
  })
})

import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "./fixtures/get-test-database"
import config from "./example-seam-graphile-worker.config"
import axios from "axios"
import getPort from "@ava/get-port"

test("should start graphile worker health server", async (t) => {
  const { connectionString } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString
  config.health_server_port = await getPort()

  const logged_items: Array<{ level: string; line: string; args: any[] }> = []
  config.logger.on("log", (level, ...args) => {
    logged_items.push({ level, args, line: `${level}: ${args.join(" ")}` })
  })

  await start({
    configPath: "./tests/example-seam-graphile-worker.config.ts",
  })

  const health_res = await axios.get(
    `http://localhost:${config.health_server_port}/health`
  )
  console.log(health_res)
})

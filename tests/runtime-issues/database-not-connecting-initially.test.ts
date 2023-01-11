import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "../fixtures/get-test-database"
import config from "../example-seam-graphile-worker.config"
import getPort from "@ava/get-port"

test("database not connecting initially", async (t) => {
  config.health_server_port = await getPort()
  let { connectionString } = await getTestDatabase()

  // replace the "postgres" user in the connection string with "invaliduser"
  connectionString = connectionString.replace("postgres:@", "invaliduser:@")

  process.env.POSTGRES_URI = connectionString
  console.log({ connectionString })

  const logged_items: Array<{ level: string; line: string; args: any[] }> = []
  config.logger.on("log", (level, ...args) => {
    logged_items.push({ level, args, line: `${level}: ${args.join(" ")}` })
  })

  await t.throwsAsync(
    start({
      configPath: "./tests/example-seam-graphile-worker.config.ts",
    })
  )
})

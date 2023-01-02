import test from "ava"
import { start } from "entrypoints/start"
import { getTestDatabase } from "./fixtures/get-test-database"

test("should start graphile worker", async (t) => {
  const { connectionString } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString

  await start()

  // TODO check health endpoint
})

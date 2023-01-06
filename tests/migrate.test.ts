import test from "ava"
import { migrate } from "entrypoints/migrate"
import { getTestDatabase } from "./fixtures/get-test-database"

test("should be able to migrate", async (t) => {
  const { connectionString } = await getTestDatabase()

  process.env.POSTGRES_URI = connectionString

  await migrate()
})

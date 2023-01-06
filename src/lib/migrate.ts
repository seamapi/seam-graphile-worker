import { makeWorkerUtils } from "graphile-worker"
import { Kysely, Migrator, PostgresDialect } from "kysely"
import { Pool } from "pg"
import * as migrations from "db/migrations"

export const migrate = async (connectionString: string) => {
  // Migrate graphile_worker schema
  const workerUtils = await makeWorkerUtils({
    connectionString,
    schema: "graphile_worker",
  })
  workerUtils.migrate()
  workerUtils.release()

  // Migrate seam_graphile_worker schema
  const pool = new Pool({ connectionString })
  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool }),
  })
  const migrator = new Migrator({
    db,
    provider: {
      getMigrations: async () => migrations,
    },
  })
  await migrator.migrateToLatest()
}

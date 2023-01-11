import { makeWorkerUtils } from "graphile-worker"
import { Kysely, Migrator, PostgresDialect } from "kysely"
import { Pool } from "pg"
import * as migrations from "db/migrations"
import { getDefaultLogger } from "./utils/get-default-logger"
import { Logger } from "types"

export const migrate = async (
  connectionString: string,
  logger: Logger = getDefaultLogger()
) => {
  logger.info("Migration (1/2) Migrating graphile_worker schema...")
  // Migrate graphile_worker schema
  const workerUtils = await makeWorkerUtils({
    connectionString,
    schema: "graphile_worker",
  })
  workerUtils.migrate()
  workerUtils.release()

  // Migrate seam_graphile_worker schema
  logger.info("Migration (2/2) Migrating seam_graphile_worker schema...")
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

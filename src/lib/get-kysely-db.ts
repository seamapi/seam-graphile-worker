import { Generated, Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"

export interface DatabaseSchema {
  "seam_graphile_worker.worker_heartbeat": {
    worker_heartbeat_id: Generated<string>
    gw_worker_id?: string
    version_build_time?: string | null
    version_commit_hash?: string | null
    was_accepting_jobs: boolean
    last_job_accepted_at: string
    last_heartbeat_at: string
    created_at: Generated<string>
  }
}

export const getKyselyDatabaseInstance = (pool: Pool) => {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({ pool }),
  })
}

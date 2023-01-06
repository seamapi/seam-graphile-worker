import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("worker_heartbeat")
    .addColumn("worker_heartbeat_id", "uuid", (col) =>
      col
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
        .primaryKey()
    )
    .addColumn("gw_worker_id", "text", (col) => col.notNull())
    .addColumn("version_build_time", "timestamptz", (col) => col)
    .addColumn("version_commit_hash", "text", (col) => col)
    .addColumn("was_accepting_jobs", "boolean", (col) => col.notNull())
    .addColumn("last_job_accepted_at", "timestamptz", (col) => col)
    .addColumn("last_heartbeat_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`current_timestamp`)
    )
    .addColumn("created_at_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`current_timestamp`)
    )
}

export async function down(db: Kysely<any>): Promise<void> {}

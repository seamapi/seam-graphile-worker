import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onSigint = async ({}: any, ctx: WorkerContext) => {
  const { logger, runner, pool, worker_state } = ctx
  logger.info("SIGINT received, stopping worker...")
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await runner.stop().catch((_error) => {})
  logger.info("Worker stopped, telling database we're not accepting jobs...")
  await db
    .update(
      "seam_graphile_worker.worker_heartbeat",
      { was_accepting_jobs: false, last_heartbeat_at: new Date() },
      { gw_worker_id: worker_state.gw_worker_id }
    )
    .run(pool)
  process.exit(0)
}

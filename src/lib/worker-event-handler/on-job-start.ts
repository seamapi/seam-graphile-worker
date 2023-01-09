import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onJobStart = async ({}: any, ctx: WorkerContext) => {
  if (!ctx.worker_state.gw_worker_id) {
    throw new Error("Job started, but no graphile worker id was found")
  }
  await db
    .update(
      "worker_heartbeat",
      { last_heartbeat_at: new Date(), last_job_accepted_at: new Date() },
      { gw_worker_id: ctx.worker_state.gw_worker_id! }
    )
    .run(ctx.pool)
  ctx.worker_state.last_active_worker_event_at = Date.now()
}

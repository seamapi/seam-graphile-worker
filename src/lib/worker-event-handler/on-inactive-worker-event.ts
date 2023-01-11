import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onInactiveWorkerEvent = async ({}: any, ctx: WorkerContext) => {
  if (ctx.worker_state.dead) return
  ctx.worker_state.dead = true
  await db
    .update(
      "seam_graphile_worker.worker_heartbeat",
      {
        was_accepting_jobs: false,
        last_heartbeat_at: new Date(),
      },
      { gw_worker_id: ctx.worker_state.gw_worker_id }
    )
    .run(ctx.pool)
}

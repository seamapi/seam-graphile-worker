import { WorkerContext } from "types"
import ms from "ms"
import * as db from "zapatos/db"

/**
 * Called every 10s, handles updating heartbeat based on worker state
 */
export const onHeartbeatInterval = async (_: any, ctx: WorkerContext) => {
  const { pool, worker_state, config } = ctx
  const { gw_worker_id, last_active_worker_event_at } = worker_state

  await db
    .update(
      "seam_graphile_worker.worker_heartbeat",
      {
        last_heartbeat_at: new Date(),
        was_accepting_jobs: !worker_state.dead,
      },
      { gw_worker_id }
    )
    .run(pool!)

  if (Date.now() - last_active_worker_event_at > ms("5m")) {
    worker_state.dead = true
  }

  // In production, kill the worker so it can automatically restart
  if (config.exit_if_dead && worker_state.dead) {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
}

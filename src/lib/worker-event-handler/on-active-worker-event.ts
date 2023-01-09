import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onActiveWorkerEvent = async ({}: any, ctx: WorkerContext) => {
  ctx.worker_state.last_active_worker_event_at = Date.now()
}

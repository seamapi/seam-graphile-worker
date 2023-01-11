import { WorkerContext } from "types"
import * as db from "zapatos/db"
import { onInactiveWorkerEvent } from "./on-inactive-worker-event"

export const onFailedToGetJob = async (ev: any, ctx: WorkerContext) => {
  ctx.logger.error(`Failed to get job: ${ev.error.toString()}`)
  await onInactiveWorkerEvent(ev, ctx)
}

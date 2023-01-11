import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onWorkerCreated = async ({ worker }: any, ctx: WorkerContext) => {
  ctx.worker_state.gw_worker_id = worker.workerId
  const state = ctx.worker_state
  const { build_time, git_commit_sha } = ctx.worker_state
  await db
    .upsert(
      "seam_graphile_worker.worker_heartbeat",
      {
        was_accepting_jobs: true,
        gw_worker_id: state.gw_worker_id as string,
        last_heartbeat_at: new Date(),
        version_build_time: build_time ? new Date(build_time) : null,
        version_commit_hash: git_commit_sha ? git_commit_sha : null,
      },
      ["gw_worker_id"]
    )
    .run(ctx.pool)
}

import { WorkerContext } from "types"

export const onWorkerCreated = async ({ worker }: any, ctx: WorkerContext) => {
  ctx.worker_state.graphile_worker_id = worker.workerId
  const state = ctx.worker_state
  await ctx.db
    .insertInto("worker_heartbeat")
    .values({
      gw_worker_id: state.graphile_worker_id as string,
      was_accepting_jobs: true,
      last_heartbeat_at: new Date(),
      version_build_time: state.build_time ? new Date(state.build_time) : null,
      version_commit_hash: state.git_commit_sha ? state.git_commit_sha : null,
    })
    .onConflict("gw_worker_id")
    .execute()
  // await db
  //   .upsert(
  //     "devops.worker_heartbeat",
  //     {
  //       was_accepting_jobs: true,
  //       graphile_worker_id,
  //       last_heartbeat_at: new Date(),
  //       version_build_time: opts.build_time
  //         ? new Date(opts.build_time)
  //         : null,
  //       version_commit_hash: opts.git_commit_sha
  //         ? buildInfo.GIT_COMMIT_SHA
  //         : null,
  //     },
  //     ["graphile_worker_id"]
  //   )
  //   .run(pool!)
}

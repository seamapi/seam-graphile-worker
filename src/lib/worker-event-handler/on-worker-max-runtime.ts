import ms from "ms"
import { WorkerContext } from "types"
import * as db from "zapatos/db"

export const onWorkerMaxRuntime = async (
  { random_offset }: any,
  ctx: WorkerContext
) => {
  console.log(
    `Stopping worker because it's been running for longer than MAX_WORKER_RUN_TIME (${
      process.env.MAX_WORKER_RUN_TIME
    }) plus a random offset of ${(random_offset / 1000 / 60).toFixed(
      2
    )} min. Worker is given 5 minutes to shut down.`
  )

  setTimeout(() => {
    console.log("Killing worker process...")
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  }, ms("5m"))

  await ctx.runner.stop()
}

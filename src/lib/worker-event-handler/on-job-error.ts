import { WorkerContext } from "types"
import * as Sentry from "@sentry/node"

export const onJobError = async (
  { worker, job, error }: any,
  ctx: WorkerContext
) => {
  ctx.logger.error("Job Error!", { error })
  if (ctx.config.report_job_errors_to_sentry) {
    ctx.logger.info("Sending error info to Sentry")
    Sentry.captureException(error, {
      extra: {
        job,
        worker_id: worker.workerId,
      },
    })
  }
}

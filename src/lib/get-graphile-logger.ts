import { Logger as GraphileLogger } from "graphile-worker"
import { Logger } from "types"

interface Opts {
  pretty?: boolean
}

export const getGraphileLogger = (logger: Logger, { pretty }: Opts = {}) =>
  new GraphileLogger((scope) => {
    return (level, message, meta) => {
      const task_text = scope.taskIdentifier ? `: ${scope.taskIdentifier}` : ""
      const job_id_text = scope.jobId ? `{${scope.jobId}}` : ""

      if (pretty) {
        message = `[${scope.label ?? "core"}${
          scope.workerId ? `(${scope.workerId}${task_text}${job_id_text})` : ""
        }] ${level.toUpperCase()}: ${message}`
      }

      if (["error", "warn", "info", "debug"].includes(level)) {
        if (message.includes("INFO: Completed task") && meta?.job) {
          // This is a particularly verbose message from graphile worker, in
          // info mode we're going to ignore the metadata, which includes stuff
          // like the payload
          logger.info(message)
          logger.debug(message, { ...scope, ...meta })
        } else {
          const log_fn = (logger as any)[level] ?? logger.info
          log_fn(message, {
            ...scope,
            ...meta,
          })
        }
      } else {
        logger.debug(message, {
          ...scope,
          ...meta,
        })
      }
    }
  })

export default getGraphileLogger

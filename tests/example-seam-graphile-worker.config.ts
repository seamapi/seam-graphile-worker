import { LogEventEmitter } from "lib/log-event-emitter"
import { SeamGraphileWorkerConfig } from "types"

export default {
  health_server_port: 3112,
  crontabs: [],
  tasks: {
    some_task: async (payload: any, ctx: any) => {
      ctx.logger.info("Ran some_task!")
    },
  },
  logger: new LogEventEmitter(),
} satisfies SeamGraphileWorkerConfig<any>

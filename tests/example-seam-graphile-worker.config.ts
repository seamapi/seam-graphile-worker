import { SeamGraphileWorkerConfig } from "types"
export default {
  crontabs: [],
  tasks: {
    some_task: async (payload: any, ctx: any) => {
      ctx.logger.info("Ran some_task!")
    },
  },
} satisfies SeamGraphileWorkerConfig<any>

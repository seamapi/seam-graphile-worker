export default `

import { z } from "zod"
import { withTaskSpec } from "../worker/with-task-spec"

export const example_task = withTaskSpec({
  task_name: "example_task",
  middlewares: [],
  payload: z.object({
    my_param: z.string()
  })
} as const)((payload, ctx) => {
  // Do stuff here! your middleware is in ctx
})

`

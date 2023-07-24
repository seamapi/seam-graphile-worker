export default `

import { z } from "zod"
import { withTaskSpec } from "../worker/with-task-spec"

export const add_job_task = withTaskSpec({
  task_name: "add_job_task",
  middlewares: [],
  payload: z.object({
    payload: z.any(),
    task: z.string(),
    options: z.any(),
  }),
} as const)(async (payload, { addJob }) => {
  await addJob(payload.task, payload.payload, payload.options)
})
`

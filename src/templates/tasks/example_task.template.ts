export default `

import { withTaskSpec } from "../worker/with-task-spec"

export const example_task = withTaskSpec({
  task_name: "example_task",
  middlewares: [],
} as const)

`

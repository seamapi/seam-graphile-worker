export default `
import { type CrontabItem } from "seam-graphile-worker"
import * as tasks from "../tasks"

export const crontabs = [
  {
    task: "example_task",
    frequency: "0 0 * * *",
    payload: { some_param: "some_value" },
    options: { priority: 1 },
  },
] satisfies CrontabItem<typeof tasks>[]

export default crontabs
`.trim()

export default `
import { type CrontabItem } from "seam-graphile-worker"
import config from "../../seam-graphile-worker.config"

export default [
  {
    task: "example_task",
    frequency: "0 0 * * *",
    payload: { some_param: "some_value" },
    options: { priority: 1 },
  },
] satisfies CrontabItem<typeof config["tasks"]>[]

`.trim()

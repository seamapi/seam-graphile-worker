export default `
import { CronTabItem } from "seam-graphile-worker"

export default [
  {
    task: "example_task",
    frequency: "0 0 * * *",
    payload: { some_param: "some_value" },
    options: { priority: 1 },
  }
] as const


`.trim()

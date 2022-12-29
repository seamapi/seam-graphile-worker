export default `

import * as tasks from "./src/tasks"
import * as crontab from "./src/worker/crontab"
import { SeamGraphileWorkerConfig } from "seam-graphile-worker"

export default {
  tasks,
  crontab
} as const satisfies SeamGraphileWorkerConfig<typeof tasks>


`.trim()

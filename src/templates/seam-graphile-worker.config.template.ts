export default `

import * as tasks from "./src/tasks"
import * as crontabs from "./src/worker/crontabs"
import { SeamGraphileWorkerConfig } from "seam-graphile-worker"

export default {
  tasks,
  crontabs
} as const satisfies SeamGraphileWorkerConfig<typeof tasks>


`.trim()

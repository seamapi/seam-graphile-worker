export default `

import * as tasks from "./src/tasks"
import * as crontab from "./src/worker/crontab"

export default {
  tasks,
  crontab
} as const


`.trim()

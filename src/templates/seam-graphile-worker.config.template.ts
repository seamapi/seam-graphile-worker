export default `

import * as tasks from "./src/tasks"
import * as crontabs from "./src/worker/crontabs"
import { SeamGraphileWorkerConfig, getDefaultLogger } from "seam-graphile-worker"

export default {
  tasks,
  crontabs,
  health_server_port: process.env.WORKER_HEALTH_SERVER_PORT,
  logger: getDefaultLogger()
} as const satisfies SeamGraphileWorkerConfig<typeof tasks>


`.trim()

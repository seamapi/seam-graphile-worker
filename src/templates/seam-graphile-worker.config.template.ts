export default `

import * as tasks from "./src/tasks"
import crontabs from "./src/worker/crontabs"
import { SeamGraphileWorkerConfig, getDefaultLogger } from "seam-graphile-worker"

export default {
  tasks,
  crontabs,
  health_server_port: process.env.WORKER_HEALTH_SERVER_PORT ?? 3002,
  logger: getDefaultLogger(),
  migrate_on_start: true,
} as const satisfies SeamGraphileWorkerConfig<typeof tasks>


`.trim()

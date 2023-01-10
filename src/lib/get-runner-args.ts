import { RunnerOptions } from "graphile-worker"
import { Pool } from "pg"
import { generateGraphileWorkerCrontab } from "./generate-graphile-worker-crontab"

import getGraphileLogger from "./get-graphile-logger"
import { CrontabItem, Logger, TaskIndexModule } from "types"

export const getRunnerArgs = ({
  pool,
  tasks,
  crontab_config,
  logger,
}: {
  pool?: Pool
  tasks: TaskIndexModule
  crontab_config: CrontabItem<any>[]
  logger: Logger
} = {}): RunnerOptions => ({
  // We parallelize workers by adding more containers, not by increasing the
  // number of graphile worker javascript routines
  // see https://github.com/seamapi/seam-connect/issues/540
  concurrency: 1,

  noHandleSignals: false,
  pollInterval: 1000,
  taskList: { ...(tasks as any) },
  crontab: generateGraphileWorkerCrontab(crontab_config),
  logger: getGraphileLogger(),
  noPreparedStatements: true,
})

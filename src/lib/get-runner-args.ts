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
  pool: Pool
  tasks: TaskIndexModule
  crontab_config: readonly CrontabItem<any>[]
  logger: Logger
}): RunnerOptions => ({
  pgPool: pool,
  // We parallelize workers by adding more containers, not by increasing the
  // number of graphile worker javascript routines
  // see https://github.com/seamapi/seam-connect/issues/540
  concurrency: 1,

  noHandleSignals: false,
  pollInterval: 1000,
  taskList: { ...tasks },
  crontab: generateGraphileWorkerCrontab(crontab_config),
  logger: getGraphileLogger(logger),
  noPreparedStatements: true,
})

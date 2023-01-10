import { Job, quickAddJob } from "graphile-worker"
import { Pool } from "pg"
import { TaskIndexModule, TaskOptions } from "types"
import computeJobKey from "./compute-job-key"

const DEFAULT_JOB_PRIORITY = 100

interface Opts<T extends TaskIndexModule, K extends keyof T> {
  pool: Pool
  task_name: K
  parameters: Parameters<T[K]>
  default_job_priorities: { [task_name in keyof T]?: number }
  options: TaskOptions
}

export const queueJob = async <
  T extends TaskIndexModule,
  K extends Extract<keyof T, string>
>({
  pool,
  task_name,
  parameters,
  default_job_priorities,
  options = {},
}: Opts<T, K>): Promise<Job> => {
  if (options.priority === undefined) {
    options.priority =
      default_job_priorities[task_name as string] ?? DEFAULT_JOB_PRIORITY
  }

  // TODO tasks_with_required_job_key?

  const job_key = computeJobKey({ task_name, parameters, options })

  const result = await quickAddJob({ pgPool: pool }, task_name, parameters, {
    jobKey: job_key,
    jobKeyMode: job_key ? "preserve_run_at" : undefined,
    maxAttempts: options.max_attempts ?? 10, // 25 is graphile worker default
    priority: options.priority,
    runAt: options.run_at ? new Date(options.run_at) : undefined,
    queueName: options.queue_name,
  })

  return result
}

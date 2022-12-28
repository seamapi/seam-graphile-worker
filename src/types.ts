import { Job } from "graphile-worker"

export interface TaskOptions {
  job_key?: string
  no_duplicates?: true | string[]
  max_attempts?: number
  priority?: number
  run_at?: Date | string | number
  queue_name?: string
}

export type TaskIndexModule = Record<string, (payload: any, opts: any) => any>

export type AddTaskFn = <Tasks extends TaskIndexModule, T extends keyof Tasks>(
  task_name: T,
  payload: Parameters<Tasks[T]>[0],
  options?: TaskOptions
) => Promise<Job>

export interface CrontabItem<Tasks extends TaskIndexModule> {
  task: keyof Tasks
  frequency: string
  payload?: Object | null | undefined
  options: TaskOptions
}

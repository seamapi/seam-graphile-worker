import type { Runner, Job } from "graphile-worker"
import { Kysely } from "kysely"
import { DatabaseSchema } from "lib/get-kysely-db"

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

export interface SeamGraphileWorkerConfig<
  Tasks extends TaskIndexModule = TaskIndexModule
> {
  tasks: Tasks
  crontabs: readonly CrontabItem<Tasks>[]
}

export interface Logger {
  log: (...args: any[]) => void
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  error: (...args: any[]) => void
}

export interface HealthServer {
  stop: () => void
}

export interface WorkerState {
  last_active_worker_event_at: number
  dead: boolean
  graphile_worker_id?: string
  build_time?: number
  git_commit_sha?: string
}

export interface WorkerContext {
  logger: Logger
  worker_state: WorkerState
  db: Kysely<DatabaseSchema>
  runner: Runner
  health_server: HealthServer
}

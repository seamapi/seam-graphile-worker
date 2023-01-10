import type { Runner, Job } from "graphile-worker"
import { Kysely } from "kysely"
import { DatabaseSchema } from "lib/get-kysely-db"
import { Pool } from "pg"

export interface TaskOptions {
  job_key?: string
  no_duplicates?: true | string[]
  max_attempts?: number
  priority?: number
  run_at?: Date | string | number
  queue_name?: string
}

export type TaskIndexModule = Record<string, (payload: any, opts: any) => any>

export type TaskFn<Payload, Return> = (
  payload: Payload,
  helpers: any
) => Promise<Return>

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
  health_server_port: number
  tasks: Tasks
  crontabs: readonly CrontabItem<Tasks>[]
  build_time?: string | number
  git_commit_sha?: string
  report_job_errors_to_sentry?: boolean
  logger?: Logger
}

export interface Logger {
  log: (...args: any[]) => void
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

export interface HealthServer {
  stop: () => void
}

export interface WorkerState {
  last_active_worker_event_at: number
  dead: boolean
  gw_worker_id?: string
  build_time?: number
  git_commit_sha?: string
}

export interface WorkerContext {
  logger: Logger
  pool: Pool
  worker_state: WorkerState
  db: Kysely<DatabaseSchema>
  runner: Runner
  health_server: HealthServer
  config: {
    report_job_errors_to_sentry: boolean
    exit_if_dead: boolean
  }
}

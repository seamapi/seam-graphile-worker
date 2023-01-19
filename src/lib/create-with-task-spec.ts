import { TaskMiddleware, TaskMiddlewareChainOptsOutput } from "types"

interface CreateWithTaskSpecParams {
  global_middlewares: readonly TaskMiddleware<any>[]
}

interface TaskSpec {
  task_name: string
  middlewares: readonly TaskMiddleware<any>[]
}

export type WithTaskSpecFn<
  GlobalSpec extends CreateWithTaskSpecParams,
  TS extends TaskSpec
> = (
  payload: any,
  opts: TaskMiddlewareChainOptsOutput<GlobalSpec["global_middlewares"]> &
    TaskMiddlewareChainOptsOutput<TS["middlewares"]> & { task_name: string }
) => any

export type CreateWithTaskSpecFunction = <
  GlobalSpec extends CreateWithTaskSpecParams
>(
  setupParams: GlobalSpec
) => <TS extends TaskSpec>(
  route_spec: TS
) => (next: WithTaskSpecFn<GlobalSpec, TS>) => any

export const createWithName =
  (name: string) => (next: any) => (payload: any, opts: any) => {
    opts.task_name = name
    return next(payload, opts)
  }

export const createWithTaskSpec = (({
  global_middlewares,
}: CreateWithTaskSpecParams) => {
  return (task_spec: TaskSpec) => {
    return (next: (payload: any, opts: any) => any) => {
      const all_middlewares = [createWithName(task_spec.task_name)].concat(
        global_middlewares.concat(task_spec.middlewares)
      )
      all_middlewares.reverse()
      for (const mw of all_middlewares) {
        next = mw(next)
      }
      return next
    }
  }
}) as any as CreateWithTaskSpecFunction

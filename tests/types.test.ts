import test from "ava"
import { expectTypeOf } from "expect-type"
import { createWithTaskSpec } from "lib/create-with-task-spec"
import {
  SeamGraphileWorkerConfig,
  TaskMiddleware,
  TaskMiddlewareChainOptsOutput,
} from "types"

test("test satisfies constraint for a config", async (t) => {
  const example_task = (payload: any, opts: any) => {
    // do something
  }

  const tasks = {
    example_task,
  } as const

  const example_config = {
    tasks,
    crontabs: [
      {
        task: "example_task",
        frequency: "0 0 * * *",
        payload: { some_param: "some_value" },
        options: { priority: 1 },
      },
    ],
    health_server_port: 3411,
  } as const satisfies SeamGraphileWorkerConfig<typeof tasks>

  t.truthy(expectTypeOf<SeamGraphileWorkerConfig<typeof tasks>>(example_config))
})

test("test middleware definition typecheck", async (t) => {
  const withWorkspace: TaskMiddleware<{
    opts_output: {
      workspace: { name: string; created_at: Date }
    }
    opts_deps: {
      pool: "somepool"
    }
    payload_deps: {
      workspace_id: number
    }
  }> = (next) => async (payload, opts) => {
    if (!opts.pool) throw new Error("never got pool")
    opts.workspace = {
      name: "asd",
      created_at: new Date(),
    }

    return next(payload, opts)
  }

  const withPool: TaskMiddleware<{
    opts_output: {
      pool: "somepool"
    }
  }> = (next) => async (payload, opts) => {
    opts.pool = "somepool"
    return next(payload, opts)
  }

  type ChainedOptsOutput = TaskMiddlewareChainOptsOutput<
    [typeof withWorkspace, typeof withPool]
  >

  t.truthy(
    expectTypeOf<ChainedOptsOutput>().toEqualTypeOf<{
      pool: "somepool"
      workspace: { name: string; created_at: Date }
    }>()
  )

  const withTaskSpec = createWithTaskSpec({
    global_middlewares: [withWorkspace, withPool],
  })

  const { payload, opts } = await new Promise<any>((resolve, reject) => {
    const taskFn = withTaskSpec({
      middlewares: [],
    })((payload, opts) => {
      resolve({ payload, opts })
    })

    taskFn({ abc: 123 }, {})
  })
})

import test from "ava"
import { expectTypeOf } from "expect-type"
import { createWithTaskSpec, WithTaskSpecFn } from "lib/create-with-task-spec"
import {
  SeamGraphileWorkerConfig,
  TaskMiddleware,
  TaskMiddlewareChainOptsOutput,
} from "types"
import { z } from "zod"

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
    global_middlewares: [withPool, withWorkspace],
  } as const)

  const withTask = withTaskSpec({
    task_name: "example",
    middlewares: [withPool],
    payload: z.object({
      my_param: z.string(),
    }),
  } as const)

  await new Promise((resolve, reject) => {
    const taskFn = withTask((payload, opts) => {
      expectTypeOf<typeof opts>().toEqualTypeOf<{
        task_name: string
        pool: "somepool"
        workspace: { name: string; created_at: Date }
      }>()
      expectTypeOf<typeof payload>().toEqualTypeOf<{ my_param: string }>()
      resolve({ payload, opts })
    })

    taskFn({ abc: 123 }, {})
  })
})

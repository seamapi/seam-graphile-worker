import test from "ava"
import { expectTypeOf } from "expect-type"
import { SeamGraphileWorkerConfig } from "types"

test("test satisfies contraint for a config", async (t) => {
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
  } as const satisfies SeamGraphileWorkerConfig<typeof tasks>

  t.truthy(expectTypeOf<SeamGraphileWorkerConfig<typeof tasks>>(example_config))
})

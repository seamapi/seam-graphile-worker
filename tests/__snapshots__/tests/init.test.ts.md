# Snapshot report for `tests/init.test.ts`

The actual snapshot is saved in `init.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## initialize seam-graphile-worker

> /somedir/package.json

    `{␊
      "name": "some-package",␊
      "scripts": {␊
        "start:worker": "seam-graphile-worker start"␊
      }␊
    }`

> /somedir/seam-graphile-worker.config.ts

    `import * as tasks from "./src/tasks"␊
    import crontabs from "./src/worker/crontabs"␊
    import { SeamGraphileWorkerConfig, getDefaultLogger } from "seam-graphile-worker"␊
    ␊
    export default {␊
      tasks,␊
      crontabs,␊
      health_server_port: process.env.WORKER_HEALTH_SERVER_PORT ?? 3002,␊
      logger: getDefaultLogger(),␊
      migrate_on_start: true,␊
    } as const satisfies SeamGraphileWorkerConfig<typeof tasks>`

> /somedir/src/tasks/example_task.ts

    `␊
    ␊
    import { withTaskSpec } from "../worker/with-task-spec"␊
    ␊
    export const example_task = withTaskSpec({␊
      task_name: "example_task",␊
      middlewares: [],␊
      payload: z.object({␊
        my_param: z.string()␊
      })␊
    } as const)((payload, ctx) => {␊
      // Do stuff here! your middleware is in ctx␊
    })␊
    ␊
    `

> /somedir/src/tasks/index.ts

    `␊
    ␊
    export { example_task } from "./example_task.ts"␊
    ␊
    `

> /somedir/src/worker/crontabs.ts

    `import { type CrontabItem } from "seam-graphile-worker"␊
    import * as tasks from "../tasks"␊
    ␊
    export const crontabs = [␊
      {␊
        task: "example_task",␊
        frequency: "0 0 * * *",␊
        payload: { some_param: "some_value" },␊
        options: { priority: 1 },␊
      },␊
    ] satisfies CrontabItem<typeof tasks>[]␊
    ␊
    export default crontabs`

> /somedir/src/worker/with-task-spec.ts

    `import {␊
      withSentry,␊
      withDatabasePool,␊
      createWithTaskSpec,␊
    } from "seam-graphile-worker"␊
    ␊
    export const withTaskSpec = createWithTaskSpec({␊
      global_middlewares: [withSentry, withDatabasePool],␊
    } as const)`

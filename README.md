# Seam Graphile Worker

This is a wrapper for Seam's opinionated usage of Graphile Worker.

## Usage

`seam-graphile-worker` is made for usage with server projects. It will automatically connect
to a database, run migrations, configure crontabs etc.

1. Install via `npm add seam-graphile-worker`
2. Run `seam-graphile-worker init` to create a `start:worker` script, a
   `seam-graphile-worker.config.ts` file, and some other boilerplate files
   in the `src/worker` directory and `src/tasks` directory.
3. To run your worker, run `npm run start:worker`

## Features

- Automatically parse environment database connection params via [pg-connection-from-env](https://github.com/seamapi/pg-connection-from-env)
- Workers log errors to Sentry
- Workers have a health endpoint
- See all your healthy workers by polling `seam_graphile_worker.worker_health`
- Automatically restart jobs that were taken by an unhealthy worker
- Task index is linted to include all tasks with predictable names
- Define your cron jobs in a simple typed file format
- Automatically validate input payloads against zod schemas
- Prevent business-logic errors from retrying automatically
- Run jobs or crons in tests easily

## Defining A New Task

Tasks

```ts
// e.g. src/tasks/my_task.ts
import { withTaskSpec } from "worker/with-task-spec"

export default withTaskSpec({
  task_name: "my_task",
})(async (payload, opts) => {
  // ...
})
```

## Customizing Worker Task Middleware

To customize worker middleware, edit the `src/worker/with-task-spec.ts` file.

```ts
import {
  withSentry,
  withDatabasePool,
  createWithTaskSpec,
} from "seam-graphile-worker"

export const withTaskSpec = createWithTaskSpec({
  middlewares: [withSentry, withDatabasePool],
})
```

### Defining New Task Middleware

You can define new Task Middleware by creating files in `src/worker/middlewares/with-*.ts`

```ts
// e.g. src/worker/middlewares/with-workspace.ts
import { TaskMiddleware } from "seam-graphile-worker"

export const withWorkspace: TaskMiddleware<{
  opts_output: {
    workspace: { name: string; created_at: Date }
  }
  opts_dependencies: {
    db: DatabaseConnection
  }
  payload_dependencies: {
    workspace_id: number
  }
}> = (next) => async (payload, opts) => {
  opts.workspace = await opts.db.one("SELECT * FROM workspace WHERE id = $1", [
    payload.workspace_id,
  ])

  return next(payload, opts)
}
```

## Defining Cron Jobs

To define cronjobs, edit `crontabs` property of `seam-graphile-worker.config.ts`

```ts
import * as tasks from "worker/tasks"

export default {
  tasks,
  crontabs: [
    {
      task: "example_task",
      frequency: "1h",
      payload: { some_param: "some_value" }
      options: { priority: 1 }
    }
  ]
}
```

## Deploying to Fly

## Technical Details

`seam-graphile-worker` maintains two schemas:

- `graphile_worker` - this is the graphile worker schema, this is not changed
  so that we have the same schema structure as upstream graphile worker
- `seam_graphile_worker` - this schema adds additional information to the
  context for graphile_worker

## Stuff seam-graphile-worker doesn't do that you should do

- Introduce logging middleware that captures logs from your job, the payload,
  and other information then inserts it to a log table or sends to a logging
  platform.

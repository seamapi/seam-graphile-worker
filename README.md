# Seam Graphile Worker

This is a wrapper for Seam's opinionated usage of Graphile Worker.

## Usage

`seam-graphile-worker` is made for usage with server projects. It will automatically connect
to a database, run migrations, configure crontabs etc.

1. Install via `npm add seam-graphile-worker`
2. Run `seam-graphile worker init` to create a `start:worker` script, a `seam-graphile-worker.config.ts` file, and a `src/tasks` directory.
3. To run your worker, run `npm run start:worker`

## Features

- Workers log errors to Sentry
- Workers have a health endpoint
- See all your healthy workers by polling `seam_graphile_worker.worker_health`
- Task index is linted to include all tasks with predictable names
- Define your cron jobs in a simple typed file format

## Defining Crontabs

# Seam Graphile Worker

This is a wrapper for Seam's opinionated usage of Graphile Worker.

## Usage

`seam-graphile-worker` is made for usage with server projects. It will automatically connect
to a database, run migrations, configure crontabs etc.

1. Install via `npm add seam-graphile-worker`
2. Add a `start:worker` script to your `package.json` as shown below:

```ts
{
  "scripts": {
    "start:worker": "seam-graphile-worker start"
  }
}
```

3. Add a `seam-graphile-worker.config.ts` file to your project root that configures the worker, see example below:

```ts
// This is the configuration file for seam-graphile-worker
export default {
  crontab: [{}],
}
```

## Features

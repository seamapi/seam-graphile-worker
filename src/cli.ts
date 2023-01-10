import { init } from "entrypoints/init"
import migrate from "entrypoints/migrate"
import { start } from "entrypoints/start"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

yargs(hideBin(process.argv))
  .command(
    "init",
    "Bootstrap project with seam-graphile-worker config",
    (yargs) => yargs.option("package-root", { type: "string", default: "." }),
    async (argv) => {
      await init(argv)
    }
  )
  .command(
    "start",
    "Start a Seam Graphile Worker",
    (yargs) => {
      return yargs
        .option("health-server-port", {
          type: "number",
          default: 3410,
        })
        .option("migrate", { default: true })
    },
    async (argv) => {
      await start(argv)
    }
  )
  .command(
    "migrate",
    "Migrate graphile_worker and seam_graphile_worker schema",
    (yargs) => yargs,
    async (argv) => {
      await migrate(argv)
    }
  ).argv

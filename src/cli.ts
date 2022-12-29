import { init } from "entrypoints/init"
import { start } from "entrypoints/start"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

yargs(hideBin(process.argv))
  .command(
    "init",
    "Bootstrap project with seam-graphile-worker config",
    (yargs) => yargs,
    async (argv) => {
      await init()
    }
  )
  .command(
    "start",
    "Start a Seam Graphile Worker",
    (yargs) => {
      return yargs.option("health-port", {
        default: "3410",
      })
    },
    async (argv) => {
      await start()
    }
  ).argv

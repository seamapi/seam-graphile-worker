import fs from "fs"
import path from "path"
import * as templates from "../templates"
import chalk from "chalk"
import mkdirp from "mkdirp"

type Operation =
  | {
      op: "change-text-file"
      path: string
      change: (content: string) => string
    }
  | {
      op: "create-file"
      path: string
      content: string
    }

interface Options {
  packageRoot: string
}

export const init = async (opts: Options = { packageRoot: process.cwd() }) => {
  let { packageRoot } = opts
  const operations: Operation[] = [
    {
      op: "change-text-file",
      path: "package.json",
      change: (contents: string) => {
        const packageJSON = JSON.parse(contents)
        packageJSON.scripts ||= {}
        packageJSON.scripts["start:worker"] = "seam-graphile-worker start"
        return JSON.stringify(packageJSON, null, 2)
      },
    },
    {
      op: "create-file",
      path: "seam-graphile-worker.config.ts",
      content: templates.config,
    },
    {
      op: "create-file",
      path: "src/worker/crontabs.ts",
      content: templates.crontabs,
    },
    {
      op: "create-file",
      path: "src/worker/with-task-spec.ts",
      content: templates.with_task_spec,
    },
    {
      op: "create-file",
      path: "src/tasks/index.ts",
      content: templates.task_index,
    },
    {
      op: "create-file",
      path: "src/tasks/example_task.ts",
      content: templates.example_task,
    },
  ]

  packageRoot ||= process.cwd()

  console.log(
    chalk.gray(`Bootstrapping seam-graphile-worker into ${packageRoot}`)
  )
  // Execute operations
  for (const op of operations) {
    const filePath = path.join(packageRoot, op.path)
    console.log(chalk.gray(`${op.op}: ${op.path}`))
    try {
      switch (op.op) {
        case "change-text-file":
          const contents = fs.readFileSync(filePath).toString()
          fs.writeFileSync(filePath, op.change(contents))
          break
        case "create-file":
          await mkdirp(path.dirname(filePath))
          fs.writeFileSync(filePath, op.content)
          break
      }
    } catch (e: any) {
      console.log(
        `${chalk.red(`Operation Failed: ${op.op} ${op.path}`)} ${chalk.gray(
          e.toString().slice(0, 40)
        )}...`
      )
    }
  }
}

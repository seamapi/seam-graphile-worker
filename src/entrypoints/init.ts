import fs from "fs"
import path from "path"

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

export const init = async () => {
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
      content: (
        await import("../templates/seam-graphile-worker.config.template")
      ).default,
    },
    {
      op: "create-file",
      path: "src/worker/crontab.ts",
      content: (await import("../templates/worker/crontab.template")).default,
    },
    {
      op: "create-file",
      path: "src/worker/with-task-spec.ts",
      content: (await import("../templates/worker/with-task-spec.template"))
        .default,
    },
    {
      op: "create-file",
      path: "src/tasks/index.ts",
      content: (await import("../templates/tasks/index.template")).default,
    },
    {
      op: "create-file",
      path: "src/tasks/example_task.ts",
      content: (await import("../templates/tasks/example_task.template"))
        .default,
    },
  ]

  const packageRoot = process.cwd()

  // Execute operations
  for (const op of operations) {
    const filePath = path.join(packageRoot, op.path)
    try {
      switch (op.op) {
        case "change-text-file":
          const contents = fs.readFileSync(filePath).toString()
          fs.writeFileSync(filePath, op.change(contents))
          break
        case "create-file":
          fs.writeFileSync(filePath, op.content)
          break
      }
    } catch (e: any) {
      console.log(`Operation Failed: ${op.op} ${op.path}`)
      console.log(e.toString())
      console.log(e.stack)
    }
  }
}

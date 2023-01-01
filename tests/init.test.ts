import mockFS from "mock-fs"
import test from "ava"
import { init } from "entrypoints/init"
import { directoryTree } from "./directory-tree"

test("initialize seam-graphile-worker", async (t) => {
  mockFS({
    "/somedir": {
      "package.json": JSON.stringify({
        name: "some-package",
        scripts: {},
      }),
    },
  })

  await init({ packageRoot: "/somedir" })

  const tree = directoryTree("/somedir")

  mockFS.restore()

  for (const fp of Object.keys(tree)) {
    t.snapshot(tree[fp], fp)
  }
})

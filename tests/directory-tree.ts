import fs from "fs"
import path from "path"

export const directoryTree = (dir: string, fileMap: any = {}) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      directoryTree(filePath, fileMap)
    } else {
      fileMap[filePath] = fs.readFileSync(filePath, "utf8")
    }
  })
  return fileMap
}

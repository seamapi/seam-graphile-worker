export default `

import {
  withSentry,
  withDatabasePool,
  createWithTaskSpec,
} from "seam-graphile-worker"

export const withTaskSpec = createWithTaskSpec({
  global_middlewares: [withSentry, withDatabasePool],
})

`.trim()

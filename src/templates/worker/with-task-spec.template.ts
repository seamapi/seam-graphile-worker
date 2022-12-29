export default `

import {
  withSentry,
  withDatabasePool,
  createWithTaskSpec,
} from "seam-graphile-worker"

export const withTaskSpec = createWithTaskSpec({
  middlewares: [withSentry, withDatabasePool],
})

`.trim()

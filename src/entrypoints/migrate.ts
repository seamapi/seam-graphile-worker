import { getConnectionStringFromEnv } from "pg-connection-from-env"
import { migrate as libMigrate } from "lib/migrate"

export const migrate = async (argv: {}) => {
  const connectionString = getConnectionStringFromEnv()
  await libMigrate(connectionString)
}

export default migrate

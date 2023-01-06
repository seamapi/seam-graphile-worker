import { makeWorkerUtils } from "graphile-worker"

export const migrate = async (connectionString: string) => {
  const workerUtils = await makeWorkerUtils({
    connectionString,
  })
  workerUtils.migrate()
  workerUtils.release()
}

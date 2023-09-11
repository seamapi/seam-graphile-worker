import type { Logger, WorkerState } from "types"
import http from "http"

interface Opts {
  worker_state: WorkerState
  port: number
  logger: Logger
}

export const startHealthServer = ({ worker_state, port, logger }: Opts) => {
  logger.info(`Starting worker health server on port ${port}`)
  const worker_health_server = http.createServer(async (req, res) => {
    if (worker_state.dead) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ worker_alive: false }))
      return
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ worker_alive: true }))
  })
  worker_health_server.listen(port)

  return {
    stop: () => {
      worker_health_server.close()
    },
  }
}

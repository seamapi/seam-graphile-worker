import EventEmitter from "node:events"
import TypedEmitter from "typed-emitter"
import { Logger } from "types"

type MessageEvents = {
  log: (
    level: "log" | "debug" | "info" | "warn" | "error",
    ...args: any[]
  ) => void
}

export class LogEventEmitter
  extends (EventEmitter as new () => TypedEmitter<MessageEvents>)
  implements Logger
{
  constructor() {
    super()
  }
  log = (...args: any[]) => {
    this.emit("log", "log", ...args)
  }
  debug = (...args: any[]) => {
    this.emit("log", "debug", ...args)
  }
  info = (...args: any[]) => {
    this.emit("log", "info", ...args)
  }
  warn = (...args: any[]) => {
    this.emit("log", "warn", ...args)
  }
  error = (...args: any[]) => {
    this.emit("log", "error", ...args)
  }
}

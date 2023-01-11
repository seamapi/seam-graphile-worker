import { Logger } from "types"

export const getDefaultLogger = (): Logger => ({
  log: console.log,
  warn: console.warn,
  debug: console.log,
  info: console.log,
  error: console.log,
})

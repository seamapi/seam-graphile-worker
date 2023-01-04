export class UnableToConnectToDatabaseError extends Error {
  constructor() {
    super("Unable to connect to database")
    this.name = "UnableToConnectToDatabaseError"
  }
}

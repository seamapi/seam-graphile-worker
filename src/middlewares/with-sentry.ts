/**
 * Attach sentry to job if job fails
 */
export const withSentry = (next: any) => (payload: any, ctx: any) => {
  // TODO
  next(payload, ctx)
}

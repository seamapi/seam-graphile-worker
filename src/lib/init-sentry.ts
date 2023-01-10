import * as Sentry from "@sentry/node"

export const initSentry = () => {
  Sentry.init({
    tracesSampleRate: 0.2,
    release: process.env.SENTRY_RELEASE,
  })
}

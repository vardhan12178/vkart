// Only ever imported dynamically (see monitoring.js): a dedicated module makes
// the Sentry SDK its own "sentryClient-*" chunk, which the service worker
// leaves out of the precache.
export { init, captureException } from "@sentry/react";

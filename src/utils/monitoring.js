// Optional error monitoring. Sentry is only downloaded and initialised when
// VITE_SENTRY_DSN is set at build time, so builds without it pay nothing.
let sentry = null;

export async function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  try {
    sentry = await import("./sentryClient");
    sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_RELEASE || undefined,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      sendDefaultPii: false,
    });
  } catch (err) {
    console.warn("Monitoring unavailable:", err?.message);
  }
}

export function reportError(error, context) {
  sentry?.captureException(error, context ? { extra: context } : undefined);
}

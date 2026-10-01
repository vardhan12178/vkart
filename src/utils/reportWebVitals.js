// Real-user Core Web Vitals, beaconed to the API (POST /api/vitals) and
// summarised on the admin dashboard. Loaded lazily after first paint so it
// never competes with the page itself.

const ENDPOINT = "/api/vitals";

function send(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: window.location.pathname,
  });
  // keepalive lets the request finish while the page is being hidden/unloaded
  // (that's when CLS and INP are finally reported). No cookies needed.
  fetch(ENDPOINT, {
    method: "POST",
    body,
    keepalive: true,
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
  }).catch(() => {});
}

export default function reportWebVitals() {
  import("web-vitals")
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(send);
      onFCP(send);
      onINP(send);
      onLCP(send);
      onTTFB(send);
    })
    .catch(() => {});
}

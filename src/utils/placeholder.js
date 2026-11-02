// Neutral square shown when an image fails to load (an inline SVG, so no third-party host is needed).
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="#eeeae2"/></svg>'
  );

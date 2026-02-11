/**
 * 1x1 transparent GIF (43 bytes).
 * Smallest valid GIF89a image — used as the tracking pixel response.
 */
export const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * 1x1 transparent SVG (~80 bytes).
 * Alternative tracking pixel for contexts where SVG is preferred.
 */
export const TRANSPARENT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';

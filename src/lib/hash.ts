import { createHash } from "node:crypto";

/**
 * Hashes an IP address with a fixed salt using SHA-256.
 * Produces a consistent hash so we can count unique visitors
 * without storing the raw IP.
 */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

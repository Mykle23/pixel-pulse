import geoip from "geoip-lite";

interface GeoResult {
  country: string | null;
  city: string | null;
}

/**
 * Normalises an IP address for geoip-lite compatibility.
 * Strips the IPv4-mapped IPv6 prefix (::ffff:) so the lookup
 * hits the IPv4 database correctly.
 */
function normaliseIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

/**
 * Looks up approximate geolocation from an IP address
 * using the local MaxMind GeoLite database (no external API calls).
 * Returns null fields for loopback / private IPs — expected in dev.
 */
export function lookupGeo(ip: string): GeoResult {
  const clean = normaliseIp(ip);
  const result = geoip.lookup(clean);

  if (!result) {
    return { country: null, city: null };
  }

  return {
    country: result.country || null,
    city: result.city || null,
  };
}

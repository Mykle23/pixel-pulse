import geoip from "geoip-lite";

interface GeoResult {
  country: string | null;
  city: string | null;
}

/**
 * Looks up approximate geolocation from an IP address
 * using the local MaxMind GeoLite database (no external API calls).
 */
export function lookupGeo(ip: string): GeoResult {
  const result = geoip.lookup(ip);

  if (!result) {
    return { country: null, city: null };
  }

  return {
    country: result.country || null,
    city: result.city || null,
  };
}

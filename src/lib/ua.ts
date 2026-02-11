import { UAParser } from "ua-parser-js";
import { isbot, isbotMatch } from "isbot";

interface UAResult {
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  isBot: boolean;
  botName: string | null;
}

/**
 * Parses a User-Agent string to extract browser, OS, device type,
 * and whether it's a bot.
 */
export function parseUA(userAgent: string | undefined): UAResult {
  if (!userAgent) {
    return {
      browser: null,
      os: null,
      deviceType: null,
      isBot: false,
      botName: null,
    };
  }

  const bot = isbot(userAgent);
  const parser = new UAParser(userAgent);
  const browserInfo = parser.getBrowser();
  const osInfo = parser.getOS();
  const deviceInfo = parser.getDevice();

  const browserName = browserInfo.name
    ? `${browserInfo.name}${browserInfo.version ? ` ${browserInfo.version}` : ""}`
    : null;

  const osName = osInfo.name
    ? `${osInfo.name}${osInfo.version ? ` ${osInfo.version}` : ""}`
    : null;

  return {
    browser: browserName,
    os: osName,
    deviceType: deviceInfo.type ?? "desktop",
    isBot: bot,
    botName: bot ? isbotMatch(userAgent) ?? "Unknown Bot" : null,
  };
}

import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",

  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  apiKey: process.env.API_KEY ?? "",
  ipSalt: process.env.IP_SALT ?? "change-me",
} as const;

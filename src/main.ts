import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./logger.js";
import { pixelGifRoute, pixelSvgRoute } from "./routes/pixel.route.js";
import { badgeRoute } from "./routes/badge.route.js";
import { healthRoute } from "./routes/health.route.js";
import { statsRouter } from "./routes/stats.route.js";

const app = express();

// Security headers
app.use(helmet());

// HTTP request logging (skip pixel/badge hits and health to reduce noise)
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => {
        const url = req.url ?? "";
        return (
          url === "/health" ||
          url.startsWith("/t/") ||
          url.startsWith("/badge/")
        );
      },
    },
  })
);

// JSON body parsing
app.use(express.json({ limit: "1mb" }));

// Rate limiting for pixel and badge endpoints (per IP)
const pixelLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "",
  // Don't return JSON for pixel routes — just end the response
  handler: (_req, res) => {
    res.status(429).end();
  },
});

// Rate limiting for stats API (per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.get("/t/:label.gif", pixelLimiter, pixelGifRoute);
app.get("/t/:label.svg", pixelLimiter, pixelSvgRoute);
app.get("/badge/:label.svg", pixelLimiter, badgeRoute);
app.get("/health", healthRoute);
app.use("/api", apiLimiter, statsRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(err, "Unhandled error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Start server
app.listen(env.port, () => {
  logger.info({ port: env.port }, "PixelPulse started");
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./logger.js";
import { pixelGifRoute, pixelSvgRoute } from "./routes/pixel.route.js";
import { badgeRoute } from "./routes/badge.route.js";
import { healthRoute } from "./routes/health.route.js";
import { statsRouter } from "./routes/stats.route.js";
import { analyticsRouter } from "./routes/analytics.route.js";

const app = express();

// Trust proxy so req.ip reads X-Forwarded-For in production
app.set("trust proxy", 1);

// CORS — allow the frontend dev server and any same-origin requests
app.use(
  cors({
    origin: env.nodeEnv === "production" ? false : true,
    credentials: true,
  })
);

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
          url.startsWith("/pixel/") ||
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

// Rate limiting for stats/analytics API (per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.get("/pixel/:label.gif", pixelLimiter, pixelGifRoute);
app.get("/pixel/:label.svg", pixelLimiter, pixelSvgRoute);
// Badge previews (?preview=true) skip rate limiting — the gallery loads many at once
app.get(
  "/badge/:label.svg",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (String(req.query.preview ?? "") === "true") return next();
    return pixelLimiter(req, res, next);
  },
  badgeRoute
);
app.get("/health", healthRoute);
app.use("/api", apiLimiter, statsRouter);
app.use("/api", apiLimiter, analyticsRouter);

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

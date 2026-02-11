import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./logger.js";
import { pixelRoute } from "./routes/pixel.route.js";
import { healthRoute } from "./routes/health.route.js";
import { statsRouter } from "./routes/stats.route.js";

const app = express();

// Security headers
app.use(helmet());

// HTTP request logging (skip pixel hits to reduce noise)
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) =>
        req.url === "/health" || (req.url?.startsWith("/t/") ?? false),
    },
  })
);

// JSON body parsing (for future API routes)
app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/t/:label.gif", pixelRoute);
app.get("/health", healthRoute);
app.use("/api", statsRouter);

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

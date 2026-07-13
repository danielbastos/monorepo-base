import fastifyEnv from "@fastify/env";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { envSchema } from "./config/env.js";
import { errorHandler } from "./error-handler.js";
import { healthRoutes } from "./routes/health.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  await app.register(fastifyEnv, {
    schema: envSchema,
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(sensible);

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: "/api/v1" });

  return app;
}

import fastifyEnv from "@fastify/env";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import {
  createAuth,
  createSmtpEmailSender,
  type EmailSender,
} from "@monorepo/auth";
import { createDatabase, type DatabaseConnection } from "@monorepo/database";
import Fastify from "fastify";
import { envSchema } from "./config/env.js";
import { errorHandler } from "./error-handler.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";

export interface BuildAppOptions {
  database?: DatabaseConnection;
  emailSender?: EmailSender;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  await app.register(fastifyEnv, {
    schema: envSchema,
  });
  try {
    new URL(app.config.APP_URL);
  } catch {
    throw new Error("APP_URL must be an absolute URL");
  }
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(sensible);

  app.setErrorHandler(errorHandler);

  const ownsDatabase = options.database === undefined;
  const database = options.database ?? createDatabase(app.config.DATABASE_URL);
  if (ownsDatabase) {
    app.addHook("onClose", async () => {
      await database.close();
    });
  }

  const emailSender =
    options.emailSender ??
    createSmtpEmailSender({
      host: app.config.SMTP_HOST,
      port: app.config.SMTP_PORT,
      secure: app.config.SMTP_SECURE,
      user: app.config.SMTP_USER,
      password: app.config.SMTP_PASSWORD,
      from: app.config.SMTP_FROM,
    });
  const auth = createAuth({
    database,
    emailSender,
    config: {
      appName: app.config.APP_NAME,
      appUrl: app.config.APP_URL,
      secret: app.config.BETTER_AUTH_SECRET,
      googleClientId: app.config.GOOGLE_CLIENT_ID,
      googleClientSecret: app.config.GOOGLE_CLIENT_SECRET,
    },
    onEmailError(error) {
      app.log.error({ err: error }, "Authentication email delivery failed");
    },
  });

  await app.register(authRoutes(auth), { prefix: "/auth/api" });
  await app.register(healthRoutes, { prefix: "/api/v1" });

  return app;
}

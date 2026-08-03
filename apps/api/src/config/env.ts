export interface AppConfig {
  PORT: number;
  HOST: string;
  LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  APP_NAME: string;
  APP_URL: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM: string;
}

export const envSchema = {
  type: "object",
  required: [
    "PORT",
    "HOST",
    "LOG_LEVEL",
    "APP_NAME",
    "APP_URL",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_FROM",
  ],
  properties: {
    PORT: { type: "integer", default: 3333 },
    HOST: { type: "string", default: "0.0.0.0" },
    LOG_LEVEL: {
      type: "string",
      enum: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
      default: "info",
    },
    APP_NAME: { type: "string", default: "Monorepo Base" },
    APP_URL: { type: "string", minLength: 1, default: "http://localhost:3000" },
    DATABASE_URL: {
      type: "string",
      default: "postgresql://app:app@localhost:5432/app",
    },
    BETTER_AUTH_SECRET: { type: "string", minLength: 32 },
    GOOGLE_CLIENT_ID: { type: "string", minLength: 1 },
    GOOGLE_CLIENT_SECRET: { type: "string", minLength: 1 },
    SMTP_HOST: { type: "string", default: "localhost" },
    SMTP_PORT: { type: "integer", default: 1025 },
    SMTP_SECURE: { type: "boolean", default: false },
    SMTP_USER: { type: "string" },
    SMTP_PASSWORD: { type: "string" },
    SMTP_FROM: {
      type: "string",
      default: "Monorepo Base <no-reply@localhost>",
    },
  },
} as const;

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}

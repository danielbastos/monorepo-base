export interface AppConfig {
  PORT: number;
  HOST: string;
  LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
}

export const envSchema = {
  type: "object",
  required: ["PORT", "HOST", "LOG_LEVEL"],
  properties: {
    PORT: { type: "integer", default: 3333 },
    HOST: { type: "string", default: "0.0.0.0" },
    LOG_LEVEL: {
      type: "string",
      enum: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
      default: "info",
    },
  },
} as const;

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}

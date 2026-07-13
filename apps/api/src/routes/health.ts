import type { FastifyPluginAsync } from "fastify";
import { healthResponseSchema } from "../schemas/health.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => {
      return { status: "ok" };
    },
  );
};

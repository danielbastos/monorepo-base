import type { FastifyPluginAsync } from "fastify";
import { healthResponseSchema } from "../schemas/health.js";

const healthSchema = {
  response: {
    200: healthResponseSchema,
  },
};

const healthOptions = {
  schema: healthSchema,
};

async function healthHandle () {
  return { status: "ok" };
}

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', healthOptions, healthHandle);
};

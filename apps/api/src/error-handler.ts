import type { FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const normalizedError =
    error instanceof Error ? error : new Error("Unknown error");
  const statusCode =
    "statusCode" in normalizedError &&
    typeof normalizedError.statusCode === "number"
      ? normalizedError.statusCode
      : 500;
  const errorCode =
    "code" in normalizedError && typeof normalizedError.code === "string"
      ? normalizedError.code
      : statusCode >= 500
        ? "INTERNAL_SERVER_ERROR"
        : "REQUEST_ERROR";

  request.log.error({ err: normalizedError }, "Request failed");

  return reply.status(statusCode).send({
    error: errorCode,
    message:
      statusCode >= 500 ? "Internal Server Error" : normalizedError.message,
    statusCode,
  });
}

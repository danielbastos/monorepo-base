import type { Auth } from "@monorepo/auth";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function requestHeaders(request: FastifyRequest) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    headers.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

function requestBody(request: FastifyRequest): string | Buffer | undefined {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  if (request.body instanceof Buffer || typeof request.body === "string") {
    return request.body;
  }

  if (request.body === undefined || request.body === null) {
    return undefined;
  }

  return JSON.stringify(request.body);
}

function toWebRequest(request: FastifyRequest, appUrl: string) {
  return new Request(new URL(request.raw.url ?? "/", appUrl), {
    method: request.method,
    headers: requestHeaders(request),
    body: requestBody(request),
  });
}

function invitationStatusFilter(
  request: FastifyRequest,
  appUrl: string,
): string | undefined {
  if (request.method !== "GET") return undefined;
  const url = new URL(request.raw.url ?? "/", appUrl);
  if (!url.pathname.endsWith("/organization/list-invitations")) {
    return undefined;
  }
  return url.searchParams.get("status") || undefined;
}

function hasInvitationStatus(value: unknown): value is { status: unknown } {
  return typeof value === "object" && value !== null && "status" in value;
}

function filterInvitationList(
  body: Buffer,
  contentType: string,
  status: string | undefined,
): Buffer {
  if (!status || !contentType.includes("application/json")) return body;

  try {
    const payload: unknown = JSON.parse(body.toString("utf8"));
    if (!Array.isArray(payload)) return body;
    return Buffer.from(
      JSON.stringify(
        payload.filter(
          (invitation) =>
            hasInvitationStatus(invitation) && invitation.status === status,
        ),
      ),
    );
  } catch {
    return body;
  }
}

export function authRoutes(auth: Auth): FastifyPluginAsync {
  return async (app) => {
    app.route({
      method: ["GET", "POST"],
      url: "/*",
      handler: async (request, reply) => {
        const status = invitationStatusFilter(request, app.config.APP_URL);
        const sensitiveOrganizationAction =
          request.method === "POST" &&
          (request.url.includes("/organization/delete") ||
            request.url.includes("/organization/update-member-role"));
        if (sensitiveOrganizationAction) {
          const session = await auth.api.getSession({
            headers: requestHeaders(request),
          });
          const createdAt = session?.session.createdAt;
          if (
            !createdAt ||
            Date.now() - new Date(createdAt).getTime() > FIFTEEN_MINUTES
          ) {
            return reply.status(401).send({
              code: "SESSION_NOT_FRESH",
              message: "Entre novamente para concluir esta operação.",
            });
          }
        }

        const response = await auth.handler(
          toWebRequest(request, app.config.APP_URL),
        );

        for (const [name, value] of response.headers) {
          if (
            name !== "set-cookie" &&
            !(status && name.toLowerCase() === "content-length")
          ) {
            reply.header(name, value);
          }
        }

        const cookies = response.headers.getSetCookie();
        if (cookies.length > 0) {
          reply.header("set-cookie", cookies);
        }

        const body = filterInvitationList(
          Buffer.from(await response.arrayBuffer()),
          response.headers.get("content-type") ?? "",
          status,
        );
        return reply.status(response.status).send(body);
      },
    });
  };
}

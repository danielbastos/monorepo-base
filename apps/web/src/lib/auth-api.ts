import { cookies, headers } from "next/headers";
import { parseString } from "set-cookie-parser";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3333";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export class AuthApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function sameSite(value?: string): "lax" | "strict" | "none" | undefined {
  const normalized = value?.toLowerCase();
  return normalized === "lax" ||
    normalized === "strict" ||
    normalized === "none"
    ? normalized
    : undefined;
}

async function applySetCookies(response: Response) {
  const store = await cookies();
  for (const header of response.headers.getSetCookie()) {
    const cookie = parseString(header);
    store.set(cookie.name, cookie.value, {
      domain: cookie.domain,
      path: cookie.path,
      expires: cookie.expires,
      maxAge: cookie.maxAge,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: sameSite(cookie.sameSite),
    });
  }
}

export async function authApi<T>(
  path: string,
  init: RequestInit = {},
  options: { updateCookies?: boolean } = {},
): Promise<T> {
  const incomingHeaders = await headers();
  const requestHeaders = new Headers(init.headers);
  const cookie = incomingHeaders.get("cookie");
  if (cookie) requestHeaders.set("cookie", cookie);
  requestHeaders.set("origin", appUrl);
  requestHeaders.set("accept", "application/json");
  if (init.body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}/auth/api${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
    redirect: "manual",
  });

  if (options.updateCookies) {
    await applySetCookies(response);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : undefined;

  if (!response.ok) {
    const error = data as { code?: string; message?: string } | undefined;
    throw new AuthApiError(
      response.status,
      error?.code ?? "AUTH_REQUEST_FAILED",
      error?.message ?? "Não foi possível concluir a solicitação.",
    );
  }

  return data as T;
}

export interface SessionData {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    activeOrganizationId?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
  };
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface FullOrganization extends OrganizationSummary {
  members: Array<{
    id: string;
    role: string;
    userId: string;
    user: { id: string; name: string; email: string; image?: string | null };
  }>;
}

export interface Invitation {
  id: string;
  email: string;
  role?: string | null;
  status: string;
  expiresAt: string;
  organizationId: string;
  organization?: OrganizationSummary;
  inviter?: { name: string; email: string };
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  organizationId: string;
  organizationName: string;
  inviterId: string;
}

export async function getSession() {
  try {
    return await authApi<SessionData | null>("/get-session");
  } catch {
    return null;
  }
}

export async function listOrganizations() {
  return authApi<OrganizationSummary[]>("/organization/list");
}

export async function listUserInvitations() {
  const invitations = await authApi<PendingInvitation[]>(
    "/organization/list-user-invitations",
  );
  return invitations.filter((invitation) => invitation.status === "pending");
}

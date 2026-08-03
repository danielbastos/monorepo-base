import { type NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3333";

export async function proxy(request: NextRequest) {
  const response = await fetch(`${apiBaseUrl}/auth/api/get-session`, {
    headers: {
      accept: "application/json",
      cookie: request.headers.get("cookie") ?? "",
      "user-agent": request.headers.get("user-agent") ?? "",
    },
    cache: "no-store",
  });

  const session = response.ok
    ? ((await response.json()) as { user?: unknown } | null)
    : null;
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const next = NextResponse.next();
  for (const cookie of response.headers.getSetCookie()) {
    next.headers.append("set-cookie", cookie);
  }
  return next;
}

export const config = {
  matcher: ["/app/:path*", "/onboarding"],
};

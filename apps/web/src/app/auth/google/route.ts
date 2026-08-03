import { type NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3333";

export async function GET(request: NextRequest) {
  const response = await fetch(`${apiBaseUrl}/auth/api/sign-in/social`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
      origin: request.nextUrl.origin,
    },
    body: JSON.stringify({
      provider: "google",
      callbackURL: "/auth/continue",
      errorCallbackURL: "/login?error=Falha%20no%20login%20com%20Google",
    }),
    redirect: "manual",
  });
  const data = (await response.json()) as { url?: string };
  if (!response.ok || !data.url) {
    return NextResponse.redirect(
      new URL("/login?error=Falha%20no%20login%20com%20Google", request.url),
    );
  }
  const redirect = NextResponse.redirect(data.url);
  for (const cookie of response.headers.getSetCookie()) {
    redirect.headers.append("set-cookie", cookie);
  }
  return redirect;
}

import type { NextRequest } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3333";

async function proxy(request: NextRequest, segments: string[]) {
  const target = new URL(
    `/auth/api/${segments.join("/")}${request.nextUrl.search}`,
    apiBaseUrl,
  );
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const response = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  const outgoingHeaders = new Headers();
  for (const [name, value] of response.headers) {
    if (name !== "set-cookie") outgoingHeaders.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) {
    outgoingHeaders.append("set-cookie", cookie);
  }

  return new Response(response.body, {
    status: response.status,
    headers: outgoingHeaders,
  });
}

type Context = { params: Promise<{ all: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).all);
}

export async function POST(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).all);
}

import assert from "node:assert/strict";
import { test } from "node:test";
import type { EmailMessage, EmailSender } from "@monorepo/auth";
import { createDatabase } from "@monorepo/database";
import { buildApp } from "../src/app.js";

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://devuser:devpass@localhost:5432/devdb";

Object.assign(process.env, {
  APP_NAME: "Monorepo Base Test",
  APP_URL: "http://localhost:3000",
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
  GOOGLE_CLIENT_ID: "test-google-client",
  GOOGLE_CLIENT_SECRET: "test-google-secret",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_SECURE: "false",
  SMTP_FROM: "Test <test@localhost>",
  PORT: "3333",
  HOST: "127.0.0.1",
  LOG_LEVEL: "silent",
});

test("registers, verifies, creates a session and authenticates through Fastify", async () => {
  const messages: EmailMessage[] = [];
  const emailSender: EmailSender = {
    async send(message) {
      messages.push(message);
    },
  };
  const database = createDatabase(databaseUrl);
  const app = await buildApp({ database, emailSender });
  const email = `auth-${crypto.randomUUID()}@example.com`;

  try {
    const registration = await app.inject({
      method: "POST",
      url: "/auth/api/sign-up/email",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      payload: {
        name: "Test User",
        email,
        password: "a-secure-password-123",
        callbackURL: "/auth/continue",
      },
    });
    assert.equal(registration.statusCode, 200, registration.body);

    await new Promise<void>((resolve) => setImmediate(resolve));
    const verificationMessage = messages.find((item) => item.to === email);
    assert.ok(verificationMessage);
    const verificationUrl =
      verificationMessage.text.match(/https?:\/\/[^\s]+/)?.[0];
    assert.ok(verificationUrl);

    const url = new URL(verificationUrl);
    const verification = await app.inject({
      method: "GET",
      url: `${url.pathname}${url.search}`,
      headers: { origin: "http://localhost:3000" },
    });
    assert.ok(
      verification.statusCode === 302 || verification.statusCode === 303,
      verification.body,
    );
    const setCookie = verification.headers["set-cookie"];
    assert.ok(setCookie);
    const cookie = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((item) => item.split(";")[0])
      .join("; ");

    const session = await app.inject({
      method: "GET",
      url: "/auth/api/get-session",
      headers: { cookie, origin: "http://localhost:3000" },
    });
    assert.equal(session.statusCode, 200, session.body);
    const body = session.json();
    assert.equal(body.user.email, email);
    assert.equal(body.user.emailVerified, true);

    const slug = `org-${crypto.randomUUID()}`;
    const createOrganization = await app.inject({
      method: "POST",
      url: "/auth/api/organization/create",
      headers: {
        cookie,
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      payload: { name: "Test Organization", slug },
    });
    assert.equal(createOrganization.statusCode, 200, createOrganization.body);
    assert.equal(createOrganization.json().slug, slug);

    const organizations = await app.inject({
      method: "GET",
      url: "/auth/api/organization/list",
      headers: { cookie, origin: "http://localhost:3000" },
    });
    assert.equal(organizations.statusCode, 200, organizations.body);
    assert.ok(
      organizations.json().some((organization: { slug: string }) => {
        return organization.slug === slug;
      }),
    );

    const organizationId = createOrganization.json().id as string;
    const invitation = await app.inject({
      method: "POST",
      url: "/auth/api/organization/invite-member",
      headers: {
        cookie,
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      payload: {
        organizationId,
        email: `invited-${crypto.randomUUID()}@example.com`,
        role: "member",
      },
    });
    assert.equal(invitation.statusCode, 200, invitation.body);
    const invitationBody = invitation.json();

    const pendingInvitations = await app.inject({
      method: "GET",
      url:
        "/auth/api/organization/list-invitations?organizationId=" +
        organizationId +
        "&status=pending",
      headers: { cookie, origin: "http://localhost:3000" },
    });
    assert.equal(pendingInvitations.statusCode, 200, pendingInvitations.body);
    assert.ok(
      pendingInvitations
        .json()
        .some((item: { id: string }) => item.id === invitationBody.id),
    );

    const cancelInvitation = await app.inject({
      method: "POST",
      url: "/auth/api/organization/cancel-invitation",
      headers: {
        cookie,
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      payload: { invitationId: invitationBody.id },
    });
    assert.equal(cancelInvitation.statusCode, 200, cancelInvitation.body);
    assert.equal(cancelInvitation.json().status, "canceled");

    const pendingAfterCancel = await app.inject({
      method: "GET",
      url:
        "/auth/api/organization/list-invitations?organizationId=" +
        organizationId +
        "&status=pending",
      headers: { cookie, origin: "http://localhost:3000" },
    });
    assert.equal(pendingAfterCancel.statusCode, 200, pendingAfterCancel.body);
    assert.ok(
      pendingAfterCancel
        .json()
        .every((item: { id: string }) => item.id !== invitationBody.id),
    );

    const canceledInvitations = await app.inject({
      method: "GET",
      url:
        "/auth/api/organization/list-invitations?organizationId=" +
        organizationId +
        "&status=canceled",
      headers: { cookie, origin: "http://localhost:3000" },
    });
    assert.equal(canceledInvitations.statusCode, 200, canceledInvitations.body);
    assert.ok(
      canceledInvitations
        .json()
        .some((item: { id: string }) => item.id === invitationBody.id),
    );
  } finally {
    await app.close();
    await database.close();
  }
});

import type { DatabaseConnection } from "@monorepo/database";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { type EmailSender, sendInBackground } from "./email.js";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

export interface AuthConfig {
  appName: string;
  appUrl: string;
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
}

export interface AuthDependencies {
  database: DatabaseConnection;
  emailSender: EmailSender;
  config: AuthConfig;
  onEmailError?: (error: unknown) => void;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function linkEmail(
  appName: string,
  title: string,
  description: string,
  url: string,
) {
  const safeUrl = escapeHtml(url);
  return {
    subject: `${title} — ${appName}`,
    text: `${description}\n\n${url}`,
    html: `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="${safeUrl}">Continuar</a></p>`,
  };
}

export function createAuth(dependencies: AuthDependencies) {
  const { config, database, emailSender } = dependencies;
  const onEmailError = dependencies.onEmailError ?? (() => undefined);
  const send = (to: string, message: ReturnType<typeof linkEmail>) =>
    sendInBackground(emailSender, { to, ...message }, onEmailError);

  return betterAuth({
    appName: config.appName,
    baseURL: config.appUrl,
    basePath: "/auth/api",
    secret: config.secret,
    database: database.authAdapter,
    trustedOrigins: [config.appUrl],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: HOUR,
      sendResetPassword: async ({ user, url }) => {
        send(
          user.email,
          linkEmail(
            config.appName,
            "Redefina sua senha",
            "Use o link abaixo para escolher uma nova senha. Ele expira em uma hora.",
            url,
          ),
        );
      },
    },
    emailVerification: {
      expiresIn: HOUR,
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        send(
          user.email,
          linkEmail(
            config.appName,
            "Confirme seu e-mail",
            "Confirme seu endereço para concluir o acesso.",
            url,
          ),
        );
      },
    },
    session: {
      expiresIn: 7 * DAY,
      updateAge: DAY,
      freshAge: 15 * 60,
    },
    account: {
      encryptOAuthTokens: true,
      accountLinking: {
        enabled: true,
        disableImplicitLinking: false,
        allowDifferentEmails: false,
      },
    },
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    plugins: [
      organization({
        invitationExpiresIn: 48 * HOUR,
        requireEmailVerificationOnInvitation: true,
        async sendInvitationEmail(data) {
          const url = `${config.appUrl}/invitations/${encodeURIComponent(data.id)}`;
          send(
            data.email,
            linkEmail(
              config.appName,
              `Convite para ${data.organization.name}`,
              `${data.inviter.user.name} convidou você para participar da organização.`,
              url,
            ),
          );
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type { EmailMessage, EmailSender, SmtpConfig } from "./email.js";
export { createSmtpEmailSender } from "./email.js";

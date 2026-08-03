"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthApiError, authApi } from "@/lib/auth-api";

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

function message(error: unknown) {
  if (error instanceof AuthApiError) {
    if (error.status === 403) return "Confirme seu e-mail antes de entrar.";
    if (error.status === 401) return "E-mail ou senha inválidos.";
    if (error.status === 429)
      return "Muitas tentativas. Aguarde e tente novamente.";
  }
  return "Não foi possível concluir a solicitação.";
}

export async function signInAction(formData: FormData) {
  const result = z
    .object({
      email: z.email(),
      password: z.string().min(1),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  const returnTo = safeReturnTo(formData.get("returnTo"), "/auth/continue");
  if (!result.success) {
    redirect(`/login?error=${encodeURIComponent("Preencha e-mail e senha.")}`);
  }

  let errorMessage: string | undefined;
  try {
    await authApi(
      "/sign-in/email",
      {
        method: "POST",
        body: JSON.stringify({
          ...result.data,
          rememberMe: true,
          callbackURL: returnTo,
        }),
      },
      { updateCookies: true },
    );
  } catch (error) {
    errorMessage = message(error);
  }

  if (errorMessage) {
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }
  redirect(returnTo);
}

export async function signUpAction(formData: FormData) {
  const result = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.email(),
      password: z.string().min(12).max(128),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não coincidem.",
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

  if (!result.success) {
    redirect(
      `/register?error=${encodeURIComponent(result.error.issues[0]?.message ?? "Dados inválidos.")}`,
    );
  }

  let errorMessage: string | undefined;
  try {
    await authApi("/sign-up/email", {
      method: "POST",
      body: JSON.stringify({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        callbackURL: "/auth/continue",
      }),
    });
  } catch (error) {
    errorMessage = message(error);
  }

  if (errorMessage) {
    redirect(`/register?error=${encodeURIComponent(errorMessage)}`);
  }
  redirect(`/verify-email?email=${encodeURIComponent(result.data.email)}`);
}

export async function requestPasswordResetAction(formData: FormData) {
  const result = z.email().safeParse(formData.get("email"));
  if (result.success) {
    try {
      await authApi("/request-password-reset", {
        method: "POST",
        body: JSON.stringify({
          email: result.data,
          redirectTo: `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password`,
        }),
      });
    } catch {
      // A resposta permanece genérica para não revelar contas existentes.
    }
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const result = z
    .object({
      token: z.string().min(1),
      password: z.string().min(12).max(128),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não coincidem.",
    })
    .safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
  if (!result.success) {
    redirect(
      `/reset-password?token=${encodeURIComponent(String(formData.get("token") ?? ""))}&error=${encodeURIComponent(result.error.issues[0]?.message ?? "Dados inválidos.")}`,
    );
  }

  let errorMessage: string | undefined;
  try {
    await authApi("/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: result.data.token,
        newPassword: result.data.password,
      }),
    });
  } catch {
    errorMessage = "O link é inválido ou expirou.";
  }
  if (errorMessage) {
    redirect(
      `/reset-password?token=${encodeURIComponent(result.data.token)}&error=${encodeURIComponent(errorMessage)}`,
    );
  }
  redirect("/login?reset=1");
}

export async function resendVerificationAction(formData: FormData) {
  const email = z.email().safeParse(formData.get("email"));
  if (email.success) {
    try {
      await authApi("/send-verification-email", {
        method: "POST",
        body: JSON.stringify({
          email: email.data,
          callbackURL: "/auth/continue",
        }),
      });
    } catch {
      // Resposta genérica.
    }
  }
  redirect(
    `/verify-email?email=${encodeURIComponent(email.success ? email.data : "")}&sent=1`,
  );
}

export async function signOutAction() {
  try {
    await authApi(
      "/sign-out",
      { method: "POST", body: JSON.stringify({}) },
      { updateCookies: true },
    );
  } finally {
    redirect("/login");
  }
}

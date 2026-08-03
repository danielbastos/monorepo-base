"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authApi } from "@/lib/auth-api";

function destination(formData: FormData, fallback: string) {
  const value = formData.get("redirectTo");
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

function withError(path: string, error: unknown) {
  const separator = path.includes("?") ? "&" : "?";
  const message =
    error instanceof Error ? error.message : "Operação não concluída.";
  return `${path}${separator}error=${encodeURIComponent(message)}`;
}

export async function createOrganizationAction(formData: FormData) {
  const redirectTo = destination(formData, "/onboarding");
  const data = z
    .object({
      name: z.string().trim().min(2).max(100),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(64),
    })
    .safeParse({ name: formData.get("name"), slug: formData.get("slug") });
  if (!data.success)
    redirect(withError(redirectTo, new Error("Nome ou slug inválido.")));

  let organization: { slug: string };
  try {
    organization = await authApi<{ slug: string }>(
      "/organization/create",
      { method: "POST", body: JSON.stringify(data.data) },
      { updateCookies: true },
    );
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`/app/${organization.slug}`);
}

export async function setActiveOrganizationAction(formData: FormData) {
  const redirectTo = destination(formData, "/auth/continue");
  const id = z.string().min(1).safeParse(formData.get("organizationId"));
  const slug = z.string().min(1).safeParse(formData.get("organizationSlug"));
  if (!id.success || !slug.success)
    redirect(withError(redirectTo, new Error("Organização inválida.")));
  try {
    await authApi(
      "/organization/set-active",
      { method: "POST", body: JSON.stringify({ organizationId: id.data }) },
      { updateCookies: true },
    );
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`/app/${slug.data}`);
}

export async function updateOrganizationAction(formData: FormData) {
  const currentSlug = String(formData.get("currentSlug") ?? "");
  const redirectTo = `/app/${currentSlug}/settings`;
  const data = z
    .object({
      organizationId: z.string().min(1),
      name: z.string().trim().min(2).max(100),
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(64),
    })
    .safeParse({
      organizationId: formData.get("organizationId"),
      name: formData.get("name"),
      slug: formData.get("slug"),
    });
  if (!data.success)
    redirect(withError(redirectTo, new Error("Dados inválidos.")));
  try {
    await authApi("/organization/update", {
      method: "POST",
      body: JSON.stringify({
        organizationId: data.data.organizationId,
        data: { name: data.data.name, slug: data.data.slug },
      }),
    });
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`/app/${data.data.slug}/settings?updated=1`);
}

export async function inviteMemberAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = `/app/${slug}/settings`;
  const data = z
    .object({
      organizationId: z.string().min(1),
      email: z.email(),
      role: z.enum(["admin", "member"]),
    })
    .safeParse({
      organizationId: formData.get("organizationId"),
      email: formData.get("email"),
      role: formData.get("role"),
    });
  if (!data.success)
    redirect(withError(redirectTo, new Error("Convite inválido.")));
  try {
    await authApi("/organization/invite-member", {
      method: "POST",
      body: JSON.stringify(data.data),
    });
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`${redirectTo}?invited=1`);
}

export async function updateMemberRoleAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = `/app/${slug}/settings`;
  const data = z
    .object({
      organizationId: z.string().min(1),
      memberId: z.string().min(1),
      role: z.enum(["owner", "admin", "member"]),
    })
    .safeParse({
      organizationId: formData.get("organizationId"),
      memberId: formData.get("memberId"),
      role: formData.get("role"),
    });
  if (!data.success)
    redirect(withError(redirectTo, new Error("Papel inválido.")));
  try {
    await authApi("/organization/update-member-role", {
      method: "POST",
      body: JSON.stringify(data.data),
    });
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`${redirectTo}?updated=1`);
}

export async function removeMemberAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = `/app/${slug}/settings`;
  try {
    await authApi("/organization/remove-member", {
      method: "POST",
      body: JSON.stringify({
        organizationId: String(formData.get("organizationId") ?? ""),
        memberIdOrEmail: String(formData.get("memberId") ?? ""),
      }),
    });
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`${redirectTo}?updated=1`);
}

export async function cancelInvitationAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = `/app/${slug}/settings`;
  try {
    await authApi("/organization/cancel-invitation", {
      method: "POST",
      body: JSON.stringify({
        invitationId: String(formData.get("invitationId") ?? ""),
      }),
    });
  } catch (error) {
    redirect(withError(redirectTo, error));
  }
  redirect(`${redirectTo}?updated=1`);
}

export async function deleteOrganizationAction(formData: FormData) {
  try {
    await authApi(
      "/organization/delete",
      {
        method: "POST",
        body: JSON.stringify({
          organizationId: String(formData.get("organizationId") ?? ""),
        }),
      },
      { updateCookies: true },
    );
  } catch (error) {
    redirect(
      withError(`/app/${String(formData.get("slug") ?? "")}/settings`, error),
    );
  }
  redirect("/auth/continue");
}

export async function leaveOrganizationAction(formData: FormData) {
  try {
    await authApi(
      "/organization/leave",
      {
        method: "POST",
        body: JSON.stringify({
          organizationId: String(formData.get("organizationId") ?? ""),
        }),
      },
      { updateCookies: true },
    );
  } catch (error) {
    redirect(
      withError(`/app/${String(formData.get("slug") ?? "")}/settings`, error),
    );
  }
  redirect("/auth/continue");
}

export async function invitationAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const decision = formData.get("decision") === "accept" ? "accept" : "reject";
  const redirectTo = destination(formData, "/auth/continue");
  try {
    await authApi(`/organization/${decision}-invitation`, {
      method: "POST",
      body: JSON.stringify({ invitationId }),
    });
  } catch (error) {
    redirect(
      withError(
        redirectTo === "/invitations"
          ? redirectTo
          : `/invitations/${invitationId}`,
        error,
      ),
    );
  }
  if (redirectTo === "/invitations") redirect(redirectTo);
  redirect("/auth/continue");
}

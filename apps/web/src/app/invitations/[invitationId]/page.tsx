import { redirect } from "next/navigation";
import { InvitationCard } from "@/components/invitation-card";
import { Alert } from "@/components/ui/alert";
import { authApi, getSession, type Invitation } from "@/lib/auth-api";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ invitationId }, query, session] = await Promise.all([
    params,
    searchParams,
    getSession(),
  ]);
  if (!session)
    redirect(
      `/login?returnTo=${encodeURIComponent(`/invitations/${invitationId}`)}`,
    );
  let invitation: Invitation;
  try {
    invitation = await authApi<Invitation>(
      `/organization/get-invitation?id=${encodeURIComponent(invitationId)}`,
    );
  } catch {
    redirect("/invitations");
  }
  return (
    <main className="mx-auto flex min-h-svh max-w-lg items-center px-4">
      <InvitationCard
        invitationId={invitationId}
        description={
          invitation.organization?.name ?? "Você recebeu um convite."
        }
      >
        {query.error ? <Alert>{query.error}</Alert> : null}
        <p className="text-sm">
          O convite será associado a <strong>{session.user.email}</strong>.
        </p>
      </InvitationCard>
    </main>
  );
}

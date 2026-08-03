import Link from "next/link";
import { redirect } from "next/navigation";
import { InvitationCard } from "@/components/invitation-card";
import { Alert } from "@/components/ui/alert";
import { getSession, listUserInvitations } from "@/lib/auth-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, query] = await Promise.all([getSession(), searchParams]);
  if (!session) redirect("/login?returnTo=%2Finvitations");

  const invitations = await listUserInvitations();
  if (invitations.length === 0) redirect("/auth/continue");

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl items-center px-4 py-10">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Convites pendentes</h1>
          <p className="text-muted-foreground">
            Você foi convidado para participar das organizações abaixo.
          </p>
        </div>
        {query.error ? <Alert>{query.error}</Alert> : null}
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitationId={invitation.id}
              redirectTo="/invitations"
              title={invitation.organizationName}
              description={
                <>
                  Acesso como {invitation.role}. Expira em{" "}
                  {formatDate(invitation.expiresAt)}.
                </>
              }
            />
          ))}
        </div>
        <Link className="text-sm underline" href="/auth/continue">
          Continuar para minha organização
        </Link>
      </div>
    </main>
  );
}

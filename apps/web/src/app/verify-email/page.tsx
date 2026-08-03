import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "../auth-actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Confirme seu e-mail"
      description="Abra o link enviado para ativar sua conta."
      footer={
        <Link className="underline" href="/login">
          Voltar ao login
        </Link>
      }
    >
      {query.sent ? <Alert>Um novo e-mail foi solicitado.</Alert> : null}
      <form action={resendVerificationAction}>
        <input type="hidden" name="email" value={query.email ?? ""} />
        <Button className="w-full" variant="outline" type="submit">
          Reenviar confirmação
        </Button>
      </form>
    </AuthShell>
  );
}

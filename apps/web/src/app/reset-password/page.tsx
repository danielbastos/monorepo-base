import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "../auth-actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const query = await searchParams;
  if (!query.token) {
    return (
      <AuthShell
        title="Link inválido"
        description="Solicite um novo link de recuperação."
      >
        <Button asChild className="w-full">
          <Link href="/forgot-password">Solicitar novo link</Link>
        </Button>
      </AuthShell>
    );
  }
  return (
    <AuthShell
      title="Nova senha"
      description="A nova senha encerrará suas outras sessões."
    >
      {query.error ? <Alert>{query.error}</Alert> : null}
      <form action={resetPasswordAction} className="space-y-4">
        <input type="hidden" name="token" value={query.token} />
        <FormField
          label="Nova senha"
          id="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
        <FormField
          label="Confirmar senha"
          id="confirmPassword"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
        <Button className="w-full" type="submit">
          Alterar senha
        </Button>
      </form>
    </AuthShell>
  );
}

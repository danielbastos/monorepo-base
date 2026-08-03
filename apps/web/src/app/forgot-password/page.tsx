import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction } from "../auth-actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Recuperar senha"
      description="Enviaremos um link se o e-mail estiver cadastrado."
      footer={
        <Link className="underline" href="/login">
          Voltar ao login
        </Link>
      }
    >
      {query.sent ? (
        <Alert>Se a conta existir, o link foi enviado.</Alert>
      ) : null}
      <form action={requestPasswordResetAction} className="space-y-4">
        <FormField
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          required
        />
        <Button className="w-full" type="submit">
          Enviar link
        </Button>
      </form>
    </AuthShell>
  );
}

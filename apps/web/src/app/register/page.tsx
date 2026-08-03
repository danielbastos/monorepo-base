import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signUpAction } from "../auth-actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre-se para criar ou participar de organizações."
      footer={
        <Link className="text-foreground underline" href="/login">
          Já tenho uma conta
        </Link>
      }
    >
      {query.error ? <Alert>{query.error}</Alert> : null}
      <form action={signUpAction} className="space-y-4">
        <FormField label="Nome" id="name" autoComplete="name" required />
        <FormField
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          required
        />
        <FormField
          label="Senha"
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
        <p className="text-xs text-muted-foreground">
          Use pelo menos 12 caracteres.
        </p>
        <Button className="w-full" type="submit">
          Criar conta
        </Button>
      </form>
      <Button asChild variant="outline" className="w-full">
        <Link href="/auth/google">Cadastrar com Google</Link>
      </Button>
    </AuthShell>
  );
}

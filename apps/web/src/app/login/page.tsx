import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signInAction } from "../auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Entrar"
      description="Acesse sua conta e suas organizações."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link className="text-foreground underline" href="/register">
            Criar conta
          </Link>
        </>
      }
    >
      {query.error ? <Alert>{query.error}</Alert> : null}
      {query.reset ? <Alert>Senha alterada. Entre novamente.</Alert> : null}
      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={query.returnTo ?? ""} />
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
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end">
          <Link className="text-sm underline" href="/forgot-password">
            Esqueci minha senha
          </Link>
        </div>
        <Button className="w-full" type="submit">
          Entrar
        </Button>
      </form>
      <div className="relative text-center text-xs text-muted-foreground before:absolute before:inset-x-0 before:top-1/2 before:border-t">
        <span className="relative bg-card px-2">ou</span>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/auth/google">Continuar com Google</Link>
      </Button>
    </AuthShell>
  );
}

import { ArrowUpRight, Building2, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 lg:px-8 lg:py-10">
      <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="absolute -right-10 -top-14 size-48 rounded-full bg-muted" />
        <div className="relative max-w-2xl">
          <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Espaço de trabalho
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Tudo pronto para começar
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            A organização{" "}
            <span className="font-medium text-foreground">
              {organizationSlug}
            </span>{" "}
            está ativa e pronta para receber membros e configurações.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/app/${organizationSlug}/settings`}>
              Configurar organização
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Settings className="size-4" />
            </div>
            <CardTitle className="mt-3">Configurações</CardTitle>
            <CardDescription>
              Atualize o nome, o endereço e os membros da organização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href={`/app/${organizationSlug}/settings`}>
                Abrir configurações
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Building2 className="size-4" />
            </div>
            <CardTitle className="mt-3">Organização ativa</CardTitle>
            <CardDescription>
              Troque de organização ou adicione uma nova diretamente pela
              sidebar.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}

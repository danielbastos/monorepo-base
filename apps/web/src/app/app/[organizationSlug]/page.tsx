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
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tenant ativo: {organizationSlug}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Autenticação concluída</CardTitle>
          <CardDescription>
            A sessão e o tenant foram validados pela API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/app/${organizationSlug}/settings`}>
              Configurar organização
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

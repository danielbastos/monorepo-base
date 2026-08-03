import { CreateOrganizationForm } from "@/components/create-organization-form";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="mx-auto flex min-h-svh max-w-xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Crie sua primeira organização</CardTitle>
          <CardDescription>
            Ela será o espaço isolado para membros e dados da sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {query.error ? <Alert>{query.error}</Alert> : null}
          <CreateOrganizationForm redirectTo="/onboarding" />
        </CardContent>
      </Card>
    </main>
  );
}

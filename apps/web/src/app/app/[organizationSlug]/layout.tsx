import { notFound, redirect } from "next/navigation";
import { OrganizationShell } from "@/components/organization-shell";
import { getSession, listOrganizations } from "@/lib/auth-api";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const [{ organizationSlug }, session, organizations] = await Promise.all([
    params,
    getSession(),
    listOrganizations(),
  ]);
  if (!session) redirect("/login");
  const organization = organizations.find(
    (item) => item.slug === organizationSlug,
  );
  if (!organization) notFound();
  return (
    <OrganizationShell
      organization={organization}
      organizations={organizations}
      session={session}
    >
      {children}
    </OrganizationShell>
  );
}

import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
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
    <div className="min-h-svh lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <AppSidebar
        organization={organization}
        organizations={organizations}
        session={session}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

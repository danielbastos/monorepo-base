import { redirect } from "next/navigation";
import {
  getSession,
  listOrganizations,
  listUserInvitations,
} from "@/lib/auth-api";

export default async function ContinuePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [organizations, invitations] = await Promise.all([
    listOrganizations(),
    listUserInvitations(),
  ]);
  if (invitations.length > 0) redirect("/invitations");
  if (organizations.length === 0) redirect("/onboarding");
  const active = organizations.find(
    (item) => item.id === session.session.activeOrganizationId,
  );
  if (active) redirect(`/app/${active.slug}`);
  redirect(`/app/${organizations[0].slug}`);
}

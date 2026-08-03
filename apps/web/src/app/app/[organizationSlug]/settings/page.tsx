import { notFound } from "next/navigation";
import {
  cancelInvitationAction,
  deleteOrganizationAction,
  inviteMemberAction,
  leaveOrganizationAction,
  removeMemberAction,
  updateMemberRoleAction,
  updateOrganizationAction,
} from "@/app/organization-actions";
import { FormField } from "@/components/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  authApi,
  type FullOrganization,
  getSession,
  type Invitation,
} from "@/lib/auth-api";

export default async function OrganizationSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{ error?: string; updated?: string; invited?: string }>;
}) {
  const [{ organizationSlug }, query, session] = await Promise.all([
    params,
    searchParams,
    getSession(),
  ]);
  let organization: FullOrganization;
  try {
    organization = await authApi<FullOrganization>(
      `/organization/get-full-organization?organizationSlug=${encodeURIComponent(organizationSlug)}&membersLimit=100`,
    );
  } catch {
    notFound();
  }
  const currentMember = organization.members.find(
    (member) => member.userId === session?.user.id,
  );
  const isMember = currentMember?.role === "member";
  const invitations: Invitation[] = isMember
    ? []
    : await authApi<Invitation[]>(
        `/organization/list-invitations?organizationId=${encodeURIComponent(organization.id)}&status=pending`,
      );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">
          Organização, membros e convites.
        </p>
      </div>
      {query.error ? <Alert>{query.error}</Alert> : null}
      {query.updated ? <Alert>Alterações salvas.</Alert> : null}
      {query.invited ? <Alert>Convite enviado.</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Organização</CardTitle>
          <CardDescription>Nome e endereço do tenant.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={updateOrganizationAction}
            className="grid gap-4 md:grid-cols-2"
          >
            <input
              type="hidden"
              name="organizationId"
              value={organization.id}
            />
            <input type="hidden" name="currentSlug" value={organizationSlug} />
            <FormField
              label="Nome"
              id="name"
              defaultValue={organization.name}
              disabled={isMember}
              required
            />
            <FormField
              label="Slug"
              id="slug"
              defaultValue={organization.slug}
              disabled={isMember}
              required
            />
            <div className="md:col-span-2">
              <Button disabled={isMember} type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!isMember ? (
        <Card>
          <CardHeader>
            <CardTitle>Convidar membro</CardTitle>
            <CardDescription>
              Admins podem gerenciar membros e convites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={inviteMemberAction}
              className="grid gap-4 md:grid-cols-[1fr_10rem_auto]"
            >
              <input
                type="hidden"
                name="organizationId"
                value={organization.id}
              />
              <input type="hidden" name="slug" value={organization.slug} />
              <FormField label="E-mail" id="email" type="email" required />
              <label className="space-y-2 text-sm font-medium">
                Papel
                <select
                  name="role"
                  className="block h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <Button className="self-end" type="submit">
                Convidar
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {organization.members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
            >
              <div className="min-w-48 flex-1">
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
              <form action={updateMemberRoleAction} className="flex gap-2">
                <input
                  type="hidden"
                  name="organizationId"
                  value={organization.id}
                />
                <input type="hidden" name="memberId" value={member.id} />
                <input type="hidden" name="slug" value={organization.slug} />
                <select
                  name="role"
                  defaultValue={member.role}
                  className="h-9 rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isMember}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Membro</option>
                </select>
                <Button
                  disabled={isMember}
                  variant="outline"
                  size="sm"
                  type="submit"
                >
                  Alterar
                </Button>
              </form>
              <form action={removeMemberAction}>
                <input
                  type="hidden"
                  name="organizationId"
                  value={organization.id}
                />
                <input type="hidden" name="memberId" value={member.id} />
                <input type="hidden" name="slug" value={organization.slug} />
                <Button
                  disabled={isMember}
                  variant="destructive"
                  size="sm"
                  type="submit"
                >
                  Remover
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>

      {!isMember ? (
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum convite pendente.
              </p>
            ) : (
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p>{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {invitation.role}
                    </p>
                  </div>
                  <form action={cancelInvitationAction}>
                    <input
                      type="hidden"
                      name="invitationId"
                      value={invitation.id}
                    />
                    <input
                      type="hidden"
                      name="slug"
                      value={organization.slug}
                    />
                    <Button size="sm" variant="outline" type="submit">
                      Cancelar
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Área de risco</CardTitle>
          <CardDescription>
            As permissões são validadas pela API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <form action={leaveOrganizationAction}>
            <input
              type="hidden"
              name="organizationId"
              value={organization.id}
            />
            <input type="hidden" name="slug" value={organization.slug} />
            <Button variant="outline" type="submit">
              Sair da organização
            </Button>
          </form>
          <form action={deleteOrganizationAction}>
            <input
              type="hidden"
              name="organizationId"
              value={organization.id}
            />
            <input type="hidden" name="slug" value={organization.slug} />
            <Button disabled={isMember} variant="destructive" type="submit">
              Excluir organização
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

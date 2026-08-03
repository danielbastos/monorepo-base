"use client";

import { createOrganizationAction } from "@/app/organization-actions";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";

export function CreateOrganizationForm({ redirectTo }: { redirectTo: string }) {
  return (
    <form action={createOrganizationAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <FormField label="Nome da organização" id="name" required />
      <FormField
        label="Slug"
        id="slug"
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        placeholder="minha-organizacao"
        required
      />
      <Button type="submit">Criar organização</Button>
    </form>
  );
}

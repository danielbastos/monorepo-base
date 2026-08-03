"use client";

import { ChevronsUpDown, LogOut, Plus, Settings, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { signOutAction } from "@/app/auth-actions";
import { setActiveOrganizationAction } from "@/app/organization-actions";
import { CreateOrganizationForm } from "@/components/create-organization-form";
import type { OrganizationSummary, SessionData } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  organization: OrganizationSummary;
  organizations: OrganizationSummary[];
  session: SessionData;
}

export function AppSidebar({
  organization,
  organizations,
  session,
}: AppSidebarProps) {
  const pathname = usePathname();
  const organizationFormRef = useRef<HTMLFormElement>(null);
  const [isCreateOrganizationOpen, setIsCreateOrganizationOpen] =
    useState(false);
  const settingsHref = `/app/${organization.slug}/settings`;
  const initials = session.user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex min-h-svh w-full flex-col border-b bg-card p-3 lg:sticky lg:top-0 lg:h-svh lg:w-72 lg:border-r lg:border-b-0">
      <Link
        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold"
        href={`/app/${organization.slug}`}
      >
        <Image
          alt="Monorepo Base"
          className="size-8"
          height={32}
          priority
          src="/brand-logo.svg"
          width={32}
        />
        <span>Monorepo Base</span>
      </Link>

      <nav aria-label="Navegação da organização" className="mt-6">
        <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">
          Organização
        </p>
        <div className="space-y-1">
          <form action={setActiveOrganizationAction} ref={organizationFormRef}>
            <input
              name="organizationSlug"
              type="hidden"
              value={organization.slug}
            />
            <input name="redirectTo" type="hidden" value={settingsHref} />
            <label className="sr-only" htmlFor="organization-selector">
              Escolher organização
            </label>
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={organization.id}
              id="organization-selector"
              name="organizationId"
              onChange={(event) => {
                const selected = organizations.find(
                  (item) => item.id === event.currentTarget.value,
                );
                const slugInput =
                  organizationFormRef.current?.elements.namedItem(
                    "organizationSlug",
                  );
                if (selected && slugInput instanceof HTMLInputElement) {
                  slugInput.value = selected.slug;
                  organizationFormRef.current?.requestSubmit();
                }
              }}
            >
              {organizations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </form>
          <button
            className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsCreateOrganizationOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            Adicionar organização
          </button>
          <Link
            aria-current={pathname === settingsHref ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === settingsHref && "bg-accent text-accent-foreground",
            )}
            href={settingsHref}
          >
            <Settings className="size-4" />
            Configuração
          </Link>
        </div>
      </nav>

      <details className="group relative mt-auto pt-6">
        <summary className="flex h-12 cursor-pointer list-none items-center gap-3 rounded-md px-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {session.user.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </summary>
        <div className="mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <form action={signOutAction}>
            <button
              className="flex h-9 w-full items-center gap-3 rounded-sm px-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
              type="submit"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </form>
        </div>
      </details>

      {isCreateOrganizationOpen ? (
        <div
          aria-labelledby="create-organization-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold"
                  id="create-organization-title"
                >
                  Adicionar organização
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie um novo espaço para sua equipe.
                </p>
              </div>
              <button
                aria-label="Fechar"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsCreateOrganizationOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-6">
              <CreateOrganizationForm redirectTo={settingsHref} />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

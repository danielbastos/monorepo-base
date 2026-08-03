"use client";

import {
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Plus,
  Settings,
  X,
} from "lucide-react";
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
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  organization: OrganizationSummary;
  organizations: OrganizationSummary[];
  session: SessionData;
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
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
    <>
      <button
        aria-label="Fechar menu"
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onMobileOpenChange(false)}
        type="button"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r bg-muted/40 p-4 shadow-2xl transition-[transform,width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none lg:translate-x-0 lg:shadow-none",
          mobileOpen && "translate-x-0",
          collapsed && "lg:w-20 lg:px-0",
        )}
      >
        <div className={cn(collapsed && "lg:flex lg:justify-center")}>
          <Link
            className={cn(
              "flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-opacity duration-200 hover:opacity-80",
              collapsed && "lg:px-0",
            )}
            href={`/app/${organization.slug}`}
            onClick={() => onMobileOpenChange(false)}
          >
            <Image
              alt="Monorepo Base"
              className="size-9 shrink-0 rounded-xl shadow-sm"
              height={32}
              priority
              src="/brand-logo.svg"
              width={32}
            />
            <span className={cn(collapsed && "lg:hidden")}>Monorepo Base</span>
          </Link>
        </div>

        <nav aria-label="Navegação da organização" className="mt-8">
          <p
            className={cn(
              "px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
              collapsed && "lg:sr-only",
            )}
          >
            Organização
          </p>
          <div className="space-y-1">
            <form
              action={setActiveOrganizationAction}
              className={cn(collapsed && "lg:hidden")}
              ref={organizationFormRef}
            >
              <input
                name="organizationSlug"
                type="hidden"
                value={organization.slug}
              />
              <input name="redirectTo" type="hidden" value={settingsHref} />
              <label className="sr-only" htmlFor="organization-selector">
                Escolher organização
              </label>
              <div className="relative">
                <select
                  className="h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-sm font-medium shadow-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
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
                      onMobileOpenChange(false);
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
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </form>
            <button
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-lg border border-dashed bg-background/70 px-3 text-left text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-solid hover:bg-background hover:text-foreground",
                collapsed && "lg:justify-center lg:px-0",
              )}
              onClick={() => setIsCreateOrganizationOpen(true)}
              type="button"
            >
              <Plus className="size-4 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>
                Adicionar organização
              </span>
            </button>
            <Link
              aria-current={pathname === settingsHref ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                pathname === settingsHref &&
                  "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",
                collapsed && "lg:justify-center lg:px-0",
              )}
              href={settingsHref}
              onClick={() => onMobileOpenChange(false)}
            >
              <Settings className="size-4 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>Configuração</span>
            </Link>
          </div>
        </nav>

        <details className="group relative mt-auto border-t pt-3">
          <summary
            className={cn(
              "flex h-12 cursor-pointer list-none items-center gap-3 rounded-lg px-2 text-sm outline-none transition-colors duration-200 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden",
              collapsed && "lg:justify-center lg:px-0",
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              {initials}
            </span>
            <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <span className="block truncate font-medium">
                {session.user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {session.user.email}
              </span>
            </span>
            <ChevronsUpDown
              className={cn(
                "size-4 text-muted-foreground",
                collapsed && "lg:hidden",
              )}
            />
          </summary>
          <div className="mt-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
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
      </aside>
      {isCreateOrganizationOpen ? (
        <div
          aria-labelledby="create-organization-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid animate-in place-items-center bg-foreground/20 p-4 fade-in duration-300 backdrop-blur-sm motion-reduce:animate-none"
          role="dialog"
        >
          <button
            aria-label="Fechar o formulário de nova organização"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsCreateOrganizationOpen(false)}
            type="button"
          />
          <div className="relative w-full max-w-md animate-in rounded-2xl border bg-card p-6 shadow-2xl zoom-in-95 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold"
                  id="create-organization-title"
                >
                  Adicionar organização
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
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
    </>
  );
}

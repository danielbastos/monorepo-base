"use client";

import {
  Building2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import type { OrganizationSummary, SessionData } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

interface OrganizationShellProps {
  children: ReactNode;
  organization: OrganizationSummary;
  organizations: OrganizationSummary[];
  session: SessionData;
}

export function OrganizationShell({
  children,
  organization,
  organizations,
  session,
}: OrganizationShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-svh bg-background">
      <AppSidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onMobileOpenChange={setIsMobileSidebarOpen}
        organization={organization}
        organizations={organizations}
        session={session}
      />
      <div
        className={cn(
          "min-h-svh transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]",
          isSidebarCollapsed && "lg:grid-cols-[5rem_minmax(0,1fr)]",
        )}
      >
        <div aria-hidden="true" className="hidden lg:block" />
        <div className="min-w-0">
          <header className="flex min-h-16 items-center justify-between border-b bg-background/80 px-5 backdrop-blur lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Abrir menu"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground lg:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
                type="button"
              >
                <Menu className="size-5" />
              </button>
              <button
                aria-label={
                  isSidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"
                }
                className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground lg:inline-flex"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                type="button"
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                <Building2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Organização ativa
                </p>
                <p className="truncate text-sm font-semibold">
                  {organization.name}
                </p>
              </div>
            </div>
            <Link
              aria-label="Configuração da organização"
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href={`/app/${organization.slug}/settings`}
            >
              <Settings className="size-4" />
            </Link>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

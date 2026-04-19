import Link from "next/link";
import { ArrowUpRight, Command, RadioTower, Search } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ConfigMissingState } from "@/components/dashboard/config-missing-state";
import { ProjectRealtimeBridge } from "@/components/dashboard/project-realtime-bridge";
import { RememberProject } from "@/components/dashboard/remember-project";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { isSupabaseConfigured } from "@/lib/env";
import { getProjectChrome } from "@/lib/data";
import { getProjectRepoLabel } from "@/lib/display";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) {
  const { projectId } = await params;
  if (!isSupabaseConfigured()) {
    return <ConfigMissingState />;
  }

  const chrome = await getProjectChrome(projectId);
  const sidebarCookieStore = await cookies();
  const defaultSidebarOpen =
    sidebarCookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  if (!chrome) {
    notFound();
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar project={chrome.project} activeTasks={chrome.activeTasks} />
      <SidebarInset className="h-screen overflow-hidden">
        <ProjectRealtimeBridge projectId={chrome.project.id} />
        <RememberProject
          projectId={chrome.project.id}
          projectName={chrome.project.name}
          repoLabel={getProjectRepoLabel(chrome.project.repo_url)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-20 shrink-0 border-b border-white/8 bg-background/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="shrink-0" />
                <div className="hidden h-8 w-px bg-white/10 md:block" />
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300">
                    Project
                  </p>
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <RadioTower className="size-4 shrink-0 text-emerald-300" />
                    <span className="truncate">{chrome.project.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${chrome.project.id}/search`}>
                    <Search className="size-4" />
                    Search
                  </Link>
                </Button>
                {chrome.project.repo_url ? (
                  <Button size="sm" asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
                    <a
                      href={chrome.project.repo_url.startsWith("http")
                        ? chrome.project.repo_url
                        : `https://${chrome.project.repo_url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Command className="size-4" />
                      Repo
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </header>
          <div
            data-project-scroll-root
            className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-6"
          >
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

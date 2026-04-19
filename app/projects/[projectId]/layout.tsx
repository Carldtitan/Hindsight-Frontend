import Link from "next/link";
import { ArrowUpRight, Command, RadioTower, Search } from "lucide-react";
import { notFound } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ConfigMissingState } from "@/components/dashboard/config-missing-state";
import { ProjectRealtimeBridge } from "@/components/dashboard/project-realtime-bridge";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { isSupabaseConfigured } from "@/lib/env";
import { getProjectChrome } from "@/lib/data";

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

  if (!chrome) {
    notFound();
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar project={chrome.project} activeTasks={chrome.activeTasks} />
      <SidebarInset>
        <ProjectRealtimeBridge projectId={chrome.project.id} />
        <div className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-background/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="hidden h-8 w-px bg-white/10 md:block" />
                <div className="space-y-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300">
                    Live team memory
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RadioTower className="size-4 text-emerald-300" />
                    <span>{chrome.project.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
          <div className="flex-1 px-4 py-6 md:px-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

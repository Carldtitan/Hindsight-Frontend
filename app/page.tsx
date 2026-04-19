import { AlertTriangle, FolderKanban, GitBranchPlus, Search } from "lucide-react";
import { cookies } from "next/headers";

import { ConfigMissingState } from "@/components/dashboard/config-missing-state";
import { EmptyState } from "@/components/dashboard/empty-state";
import { WorkspaceViewScrollReset } from "@/components/dashboard/workspace-view-scroll-reset";
import {
  ProjectBrowser,
  type ProjectBrowserItem,
} from "@/components/dashboard/project-browser";
import { WorkspaceSidebar } from "@/components/dashboard/workspace-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  getOutcomeHeadline,
  getProjectRepoHref,
  getProjectRepoLabel,
} from "@/lib/display";
import { isSupabaseConfigured } from "@/lib/env";
import { formatRelativeTime } from "@/lib/formatting";
import { getProjects, getProjectOverview } from "@/lib/data";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <ConfigMissingState />;
  }

  const projects = await getProjects();
  const sidebarCookieStore = await cookies();
  const defaultSidebarOpen =
    sidebarCookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  if (projects.length === 0) {
    return (
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <WorkspaceSidebar projects={[]} />
        <SidebarInset className="h-screen overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="z-20 shrink-0 border-b border-white/8 bg-background/90 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <SidebarTrigger className="shrink-0" />
                  <div className="hidden h-8 w-px bg-white/10 md:block" />
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300">
                      Workspace
                    </p>
                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                      <FolderKanban className="size-4 shrink-0 text-sky-300" />
                      <span className="truncate">Projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <div
              data-workspace-scroll-root
              className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6"
            >
              <WorkspaceViewScrollReset />
              <PageHeader
                eyebrow="Workspace"
                title="Projects"
                description="Project history will appear here after tasks and attempts are synced."
                helpText="Each project groups the tasks, attempts, and outcomes recorded for one codebase."
                breadcrumbs={[{ title: "Projects" }]}
                actions={
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-muted-foreground"
                  >
                    0 projects
                  </Badge>
                }
              />
              <EmptyState
                icon={FolderKanban}
                title="No projects available"
                description="The database is connected, but no project rows exist yet."
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const projectSnapshots = await Promise.all(
    projects.map(async (project) => ({
      project,
      overview: await getProjectOverview(project.id),
    })),
  );
  const totalActiveTasks = projectSnapshots.reduce(
    (sum, snapshot) => sum + (snapshot.overview?.stats.active_tasks ?? 0),
    0,
  );
  const totalFailed24h = projectSnapshots.reduce(
    (sum, snapshot) => sum + (snapshot.overview?.stats.failed_attempts_24h ?? 0),
    0,
  );
  const browserProjects: ProjectBrowserItem[] = projectSnapshots.map(({ project, overview }) => {
    const latestAttempt = overview?.attempts[0] ?? null;
    const hottestFile = overview?.stats.top_dead_end_files[0] ?? null;

    return {
      id: project.id,
      name: project.name,
      repoLabel: getProjectRepoLabel(project.repo_url),
      repoHref: getProjectRepoHref(project.repo_url),
      openTasks: overview?.stats.active_tasks ?? 0,
      failed24h: overview?.stats.failed_attempts_24h ?? 0,
      attemptsShown: overview?.attempts.length ?? 0,
      latestAttemptSummary: latestAttempt?.attempt.summary ?? null,
      latestOutcomeHeadline: getOutcomeHeadline(latestAttempt?.outcomes[0] ?? null),
      latestAttemptAt: latestAttempt
        ? formatRelativeTime(latestAttempt.attempt.started_at)
        : null,
      hotFilePath: hottestFile?.path ?? null,
      hotFileSignal: hottestFile?.latest_failure_signal ?? null,
    };
  });
  const sidebarProjects = projects.slice(0, 6).map((project) => ({
    id: project.id,
    name: project.name,
  }));

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <WorkspaceSidebar projects={sidebarProjects} />
      <SidebarInset className="h-screen overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-20 shrink-0 border-b border-white/8 bg-background/90 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <SidebarTrigger className="shrink-0" />
                <div className="hidden h-8 w-px bg-white/10 md:block" />
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300">
                    Workspace
                  </p>
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <FolderKanban className="size-4 shrink-0 text-sky-300" />
                    <span className="truncate">Projects</span>
                  </div>
                </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="#project-search">
                      <Search className="size-4" />
                      Search
                    </a>
                  </Button>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-muted-foreground"
                  >
                    {projectSnapshots.length} {projectSnapshots.length === 1 ? "project" : "projects"}
                  </Badge>
                </div>
              </div>
            </header>

          <div
            data-workspace-scroll-root
            className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6"
          >
            <WorkspaceViewScrollReset />
            <div className="flex min-h-0 flex-1 flex-col gap-6">
              <PageHeader
                eyebrow="Workspace"
                title="Projects"
                description="Select a project to inspect recent work, failures, and outcomes."
                helpText="Use this page to move between projects. Each card summarizes recent activity for one codebase."
                breadcrumbs={[{ title: "Projects" }]}
              />

              <section className="grid gap-4 xl:grid-cols-3">
                <StatCard
                  icon={FolderKanban}
                  label="Projects"
                  value={String(projectSnapshots.length)}
                  helpText="Total projects currently tracked in team memory."
                />
                <StatCard
                  icon={GitBranchPlus}
                  label="Open tasks"
                  value={String(totalActiveTasks)}
                  helpText="Tasks that are still open across all projects."
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Failed attempts / 24h"
                  value={String(totalFailed24h)}
                  helpText="Failed or reverted attempts recorded in the last 24 hours."
                />
              </section>

              <ProjectBrowser projects={browserProjects} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

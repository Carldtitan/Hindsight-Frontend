"use client";

import Link from "next/link";
import { ArrowUpRight, GitBranch, Search } from "lucide-react";
import { useState } from "react";

import { RECENT_PROJECT_STORAGE_KEY } from "@/components/dashboard/remember-project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface ProjectBrowserItem {
  id: string;
  name: string;
  repoLabel: string;
  repoHref: string | null;
  openTasks: number;
  failed24h: number;
  attemptsShown: number;
  latestAttemptSummary: string | null;
  latestOutcomeHeadline: string;
  latestAttemptAt: string | null;
  hotFilePath: string | null;
  hotFileSignal: string | null;
}

interface RecentProjectRecord {
  projectId: string;
  projectName: string;
  repoLabel: string;
  updatedAt: number;
}

interface ProjectBrowserProps {
  projects: ProjectBrowserItem[];
}

function readRecentProjectValue() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(RECENT_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ProjectBrowser({ projects }: ProjectBrowserProps) {
  const [query, setQuery] = useState("");
  const [recentProjectValue] = useState<string | null>(() => readRecentProjectValue());
  let recentProject: RecentProjectRecord | null = null;

  if (recentProjectValue) {
    try {
      recentProject = JSON.parse(recentProjectValue) as RecentProjectRecord;
    } catch {
      recentProject = null;
    }
  }

  const recentProjectId = recentProject?.projectId ?? null;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (!normalizedQuery) {
      return true;
    }

    return [project.name, project.repoLabel]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const sortedProjects = [...filteredProjects].sort((left, right) => {
    const leftIsRecent = left.id === recentProjectId;
    const rightIsRecent = right.id === recentProjectId;

    if (leftIsRecent !== rightIsRecent) {
      return leftIsRecent ? -1 : 1;
    }

    if (left.openTasks !== right.openTasks) {
      return right.openTasks - left.openTasks;
    }

    if (left.attemptsShown !== right.attemptsShown) {
      return right.attemptsShown - left.attemptsShown;
    }

    return left.name.localeCompare(right.name);
  });
  const recentProjectEntry =
    recentProjectId ? projects.find((project) => project.id === recentProjectId) ?? null : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a project"
            aria-label="Find a project"
            className="h-9 border-white/10 bg-transparent"
          />
        </div>
        {recentProjectEntry ? (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/projects/${recentProjectEntry.id}`}>Open recent</Link>
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-1">
        {sortedProjects.length === 0 ? (
          <Card className="border border-white/10 bg-card">
            <CardContent className="py-8">
              <p className="text-sm font-medium text-foreground">No matching projects</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different name or repository.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {sortedProjects.map((project) => (
              <Card
                key={project.id}
                className="min-w-0 border border-white/10 bg-card shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)]"
              >
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="break-words text-xl">{project.name}</CardTitle>
                        {project.id === recentProjectId ? (
                          <Badge
                            variant="outline"
                            className="border-sky-400/30 bg-sky-400/10 text-sky-200"
                          >
                            Recent
                          </Badge>
                        ) : null}
                      </div>
                      {project.repoHref ? (
                        <a
                          href={project.repoHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <GitBranch className="size-4" />
                          <span>{project.repoLabel}</span>
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{project.repoLabel}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {project.repoHref ? (
                        <Button asChild variant="outline" size="sm">
                            <a href={project.repoHref} target="_blank" rel="noreferrer">
                            <GitBranch className="size-4" />
                            Repo
                            <ArrowUpRight className="size-4" />
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild variant="outline">
                        <Link href={`/projects/${project.id}`}>Open dashboard</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Open tasks
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{project.openTasks}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Failed / 24h
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{project.failed24h}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Attempts shown
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{project.attemptsShown}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm text-muted-foreground">Latest attempt</p>
                      <div className="mt-3 space-y-2">
                        <p className="text-pretty break-words font-medium text-foreground">
                          {project.latestAttemptSummary ?? "Summary unavailable"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.latestOutcomeHeadline}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.latestAttemptAt ?? "No attempts recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-sm text-muted-foreground">Hot file</p>
                      <div className="mt-3 space-y-2">
                        {project.hotFilePath ? (
                          <>
                            <p className="break-all font-mono text-sm text-foreground">
                              {project.hotFilePath}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {project.hotFileSignal ?? "Failure recorded"}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No hotspots yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

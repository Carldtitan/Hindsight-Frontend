"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FolderGit2,
  FolderKanban,
  GitBranchPlus,
  Radar,
} from "lucide-react";

import { SidebarStatusFooter } from "@/components/dashboard/sidebar-status-footer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getProjectRepoLabel, getTaskTitle } from "@/lib/display";
import { getProjectNavigation } from "@/lib/navigation";
import type { Project, Task } from "@/lib/types";

interface AppSidebarProps {
  project: Project;
  activeTasks: Task[];
}

export function AppSidebar({ project, activeTasks }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationItems = getProjectNavigation(project.id);
  const overviewHref = `/projects/${project.id}`;
  const isActivityView = searchParams.get("view") === "activity";

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-white/8 px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/4 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300">
            <Radar className="size-5" />
          </div>
          <div className="min-w-0 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-foreground">
              {project.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {getProjectRepoLabel(project.repo_url)}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip="Projects"
                  aria-label="Projects"
                >
                  <Link href="/">
                    <FolderKanban />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Current project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.view === "activity"
                        ? pathname === overviewHref && isActivityView
                        : pathname === item.href && !isActivityView
                    }
                    tooltip={item.title}
                    className={
                      item.title === "Overview"
                        ? "data-[active=true]:bg-sky-500/12 data-[active=true]:text-sky-100 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.28)]"
                        : item.view === "activity"
                          ? "data-[active=true]:bg-amber-500/12 data-[active=true]:text-amber-100 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(245,158,11,0.28)]"
                        : undefined
                    }
                    aria-label={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Active tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeTasks.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="No ongoing tasks" aria-label="No ongoing tasks">
                    <FolderGit2 />
                    <span>No ongoing tasks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                activeTasks.map((task) => (
                  <SidebarMenuItem key={task.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`/projects/${project.id}/tasks/${task.id}`)}
                      tooltip={getTaskTitle(task)}
                      aria-label={getTaskTitle(task)}
                    >
                      <Link href={`/projects/${project.id}/tasks/${task.id}`}>
                        <GitBranchPlus />
                        <span>{getTaskTitle(task)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/8 px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <SidebarStatusFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

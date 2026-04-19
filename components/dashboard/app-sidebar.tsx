"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, GitBranchPlus, Radar } from "lucide-react";

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
import { getProjectNavigation } from "@/lib/navigation";
import type { Project, Task } from "@/lib/types";

interface AppSidebarProps {
  project: Project;
  activeTasks: Task[];
}

export function AppSidebar({ project, activeTasks }: AppSidebarProps) {
  const pathname = usePathname();
  const navigationItems = getProjectNavigation(project.id);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-white/8 px-3 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-3">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300">
            <Radar className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {project.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {project.id}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Project surfaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
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
                  <SidebarMenuButton>
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
                    >
                      <Link href={`/projects/${project.id}/tasks/${task.id}`}>
                        <GitBranchPlus />
                        <span>{task.title ?? "Untitled task"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/8 px-3 py-4">
        <div className="rounded-2xl border border-white/10 bg-white/4 px-3 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Read-only
          </p>
          <p className="mt-2 text-sm text-foreground">
            P2 consumes Supabase contracts but does not create or mutate project memory.
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

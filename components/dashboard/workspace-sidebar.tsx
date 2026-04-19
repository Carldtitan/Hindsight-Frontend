"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, FolderKanban, Radar } from "lucide-react";

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

interface WorkspaceSidebarProject {
  id: string;
  name: string;
}

interface WorkspaceSidebarProps {
  projects: WorkspaceSidebarProject[];
}

export function WorkspaceSidebar({ projects }: WorkspaceSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-white/8 px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/4 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300">
            <Radar className="size-5" />
          </div>
          <div className="min-w-0 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-foreground">Hindsight</p>
            <p className="truncate text-[11px] text-muted-foreground">Project index</p>
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
          <SidebarGroupLabel>Recent projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="No projects yet" aria-label="No projects yet">
                    <FolderGit2 />
                    <span>No projects yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={project.name}
                      aria-label={project.name}
                    >
                      <Link href={`/projects/${project.id}`}>
                        <FolderGit2 />
                        <span>{project.name}</span>
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

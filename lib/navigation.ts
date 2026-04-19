import {
  Activity,
  FolderKanban,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  view?: "activity";
}

export function getProjectNavigation(projectId: string): NavigationItem[] {
  return [
    {
      title: "Overview",
      href: `/projects/${projectId}`,
      icon: FolderKanban,
    },
    {
      title: "Search",
      href: `/projects/${projectId}/search`,
      icon: Search,
    },
    {
      title: "Activity",
      href: `/projects/${projectId}?view=activity`,
      icon: Activity,
      view: "activity",
    },
  ];
}

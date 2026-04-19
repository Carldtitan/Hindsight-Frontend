"use client";

import { LockKeyhole } from "lucide-react";

export function SidebarStatusFooter() {
  return (
    <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center">
      <div className="rounded-xl border border-white/10 bg-white/4 p-2 text-sky-300">
        <LockKeyhole className="size-4" />
      </div>
      <div className="flex flex-wrap items-center gap-2 group-data-[collapsible=icon]:hidden">
        <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[11px] font-medium text-foreground">
          Internal
        </span>
        <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[11px] text-muted-foreground">
          Read-only
        </span>
      </div>
    </div>
  );
}

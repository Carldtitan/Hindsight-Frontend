"use client";

import { CircleHelp } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoHintProps {
  children: React.ReactNode;
  className?: string;
}

export function InfoHint({ children, className }: InfoHintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Show description"
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-muted-foreground transition-colors hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-200 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            className,
          )}
        >
          <CircleHelp className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <span className="block max-w-[20rem] leading-5">{children}</span>
      </TooltipContent>
    </Tooltip>
  );
}

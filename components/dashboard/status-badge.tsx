import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAttemptStatusMeta } from "@/lib/status";
import type { AttemptStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: AttemptStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = getAttemptStatusMeta(status);

  return (
    <Badge className={cn("gap-2 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]", meta.badgeClassName)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </Badge>
  );
}

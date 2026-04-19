import { type LucideIcon } from "lucide-react";

import { InfoHint } from "@/components/dashboard/info-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helpText: string;
}

export function StatCard({ icon: Icon, label, value, helpText }: StatCardProps) {
  return (
    <Card className="surface-panel border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <InfoHint>{helpText}</InfoHint>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-sky-300">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

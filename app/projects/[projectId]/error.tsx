"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="surface-panel mx-auto max-w-3xl border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3 text-rose-300">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle>Project route failed</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset}>Retry route</Button>
      </CardContent>
    </Card>
  );
}

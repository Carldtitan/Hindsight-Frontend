import { DatabaseZap, Settings2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/lib/env";

export function ConfigMissingState() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="surface-panel surface-grid w-full max-w-3xl overflow-hidden border">
        <CardHeader className="border-b border-white/10 bg-white/2">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3 text-sky-300">
              <DatabaseZap className="size-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight">
                Supabase is not configured
              </CardTitle>
              <p className="max-w-2xl text-sm text-muted-foreground">
                The P2 dashboard compiles without backend credentials, but it needs
                the shared team Supabase URL and anon key before it can load project
                memory.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Alert className="border-sky-500/20 bg-sky-500/8 text-sky-100">
            <Settings2 className="size-4" />
            <AlertTitle>Required .env.local values</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-xs leading-6 text-sky-100/80">
              {PUBLIC_SUPABASE_URL}
              <br />
              {PUBLIC_SUPABASE_ANON_KEY}
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-sky-500 text-slate-950 hover:bg-sky-400">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
                Open Supabase
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://vercel.com/docs/projects/environment-variables"
                target="_blank"
                rel="noreferrer"
              >
                Vercel env docs
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            P3 owns provisioning the Supabase project, RPCs, edge function, and
            realtime setup. This frontend only consumes those contracts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { startTransition, useEffect, useEffectEvent, useRef } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface ProjectRealtimeBridgeProps {
  projectId: string;
}

export function ProjectRealtimeBridge({
  projectId,
}: ProjectRealtimeBridgeProps) {
  const router = useRouter();
  const refreshTimeout = useRef<number | null>(null);
  const client = createBrowserSupabaseClient();

  const scheduleRefresh = useEffectEvent(() => {
    if (refreshTimeout.current) {
      window.clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = window.setTimeout(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 220);
  });

  useEffect(() => {
    if (!client) {
      return;
    }

    const attemptsChannel = client
      .channel(`attempts-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attempts",
          filter: `project_id=eq.${projectId}`,
        },
        () => scheduleRefresh(),
      )
      .subscribe();

    const outcomesChannel = client
      .channel(`outcomes-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "outcomes",
        },
        () => scheduleRefresh(),
      )
      .subscribe();

    return () => {
      if (refreshTimeout.current) {
        window.clearTimeout(refreshTimeout.current);
      }

      void client.removeChannel(attemptsChannel);
      void client.removeChannel(outcomesChannel);
    };
  }, [client, projectId]);

  return null;
}

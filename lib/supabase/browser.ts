"use client";

import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createClient> | null | undefined;

export function createBrowserSupabaseClient() {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const env = getPublicSupabaseEnv();

  browserClient = env
    ? createClient(env.url, env.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

  return browserClient;
}

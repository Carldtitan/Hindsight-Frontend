import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/env";

export function createServerSupabaseClient() {
  const env = getPublicSupabaseEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let hasWarned = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!hasWarned && typeof window !== "undefined") {
      console.info(
        "Supabase environment variables not detected (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Operating with local in-memory listing store."
      );
      hasWarned = true;
    }
    return null;
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

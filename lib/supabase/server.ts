import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Prefer the service_role key (bypasses RLS) for server-side operations.
 * Falls back to the anon key — safe for this MVP because RLS is disabled.
 * NEVER import this client in browser code.
 */
const serverKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !serverKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY ' +
    'or NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.'
  );
}

/**
 * Server-side Supabase client.
 * Use only in Server Components, Route Handlers, and Server Actions.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(supabaseUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * /lib/supabase.ts
 *
 * Convenience top-level re-export of the Supabase clients.
 *
 * Usage:
 *   Server Components / Route Handlers → import { createServiceClient } from '@/lib/supabase'
 *   Client Components                  → import { supabase } from '@/lib/supabase'
 */

export { createServiceClient } from './supabase/server';
export { supabase } from './supabase/client';

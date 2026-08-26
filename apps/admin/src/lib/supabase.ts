import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://eisqbwanrguvoxguqpjz.supabase.co';

const supabaseKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_P4GkZUl1cAg6qveKe1kvTw_GsXNPl-Y';

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export function getSupabaseClient() {
  return supabase;
}

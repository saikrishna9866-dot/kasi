import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zuzbdwsfvhqetofbjiyv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1emJkd3NmdmhxZXRvZmJqaXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzUyMTcsImV4cCI6MjA5MDgxMTIxN30.OcGfSzviAKixdF9IaOaRMshewQvC-aigJTzvwt5399c';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Using default values for preview.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

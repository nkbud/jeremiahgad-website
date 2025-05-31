import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lyeqplsjroegqnifgxez.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZXFwbHNqcm9lZ3FuaWZneGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjgwNzMsImV4cCI6MjA2NDA0NDA3M30.Fn38lbPZ73wxw18SEaetoF8qYZkN7GuLEd3z-XjJK7I';

// Session management configuration - disabled by default for free tier compatibility
const enableSessions = import.meta.env.VITE_ENABLE_SESSIONS === 'true';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: enableSessions,
    persistSession: enableSessions,
    detectSessionInUrl: enableSessions
  }
});
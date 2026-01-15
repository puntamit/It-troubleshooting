import { createClient } from '@supabase/supabase-js'

// FORCE HARDCODED VALUES FOR DEBUGGING
// Ignoring process.env to rule out invisible character issues
const SUPABASE_URL = 'https://bgxcskftzqlohortnhlu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneGNza2Z0enFsb2hvcnRuaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTQzNzIsImV4cCI6MjA4MzkzMDM3Mn0.X-woBI_hBOpcrYST7v0sMOcjMZofcYZg78q1-jjXKlU';

console.log('Supabase Client: Initializing (Persistence Restore)');

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

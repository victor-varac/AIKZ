import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://akvxtsihvyezsoaifzkg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdnh0c2lodnllenNvYWlmemtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTI1NzQsImV4cCI6MjA3NDA4ODU3NH0.aeusV-zL3CSKSe8QiU-5luLnfbq4SZNLvYq5G8df-Xo';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
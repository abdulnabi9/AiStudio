import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in browser or Node
const getEnv = (key: string) => {
  // Check for Vite's import.meta.env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Check for process.env (if polyfilled or Node)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Access environment variables or use provided keys
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://ssthervuxfizcsmwhdmw.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdGhlcnZ1eGZpemNzbXdoZG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjY4OTksImV4cCI6MjA3OTU0Mjg5OX0.2O2ol05DtgEyBmhOU-0g7VhqlWVK9qd6k_a-no6rSkM';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
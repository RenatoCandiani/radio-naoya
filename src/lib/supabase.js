import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ygifgplxganolpgolzii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWZncGx4Z2Fub2xwZ29semlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDk4NTIsImV4cCI6MjA5NzM4NTg1Mn0.UUg6EY2aZwbV1aQqWPKIiQF0LVKqAyRGyUfsi9jNIbs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

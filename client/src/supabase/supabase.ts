// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chshfxzxdtdyyzcnnusr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoc2hmeHp4ZHRkeXl6Y25udXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTgwNzUsImV4cCI6MjA2MzMzNDA3NX0.t02Lnx8Jtuw8yZSNsa4nmv4sZLXIUGXPWBJpNiH0kl0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

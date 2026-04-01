import { createClient } from '@supabase/supabase-js';

// On utilise le préfixe NEXT_PUBLIC_ pour que les variables soient accessibles côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

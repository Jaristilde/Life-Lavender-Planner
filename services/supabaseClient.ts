
import { createClient } from '@supabase/supabase-js';

// Fix: Use type assertion on import.meta to access .env which is provided by Vite but might not be in default TS types
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://mydfhhqwfzhogydqekxn.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_DpSmgKWQumD373kC1o6qbg_k0GwJDGt';

export const supabase = createClient(supabaseUrl, supabaseKey);

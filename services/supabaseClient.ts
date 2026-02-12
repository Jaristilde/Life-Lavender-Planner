
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mydfhhqwfzhogydqekxn.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_DpSmgKWQumD373kC1o6qbg_k0GwJDGt';

export const supabase = createClient(supabaseUrl, supabaseKey);


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uusvorligoaffxbjxskr.supabase.co';
// IMPORTANTE: Esta chave 'sb_publishable_...' parece ser uma chave de gerenciamento ou temporária.
// Para o funcionamento do catálogo público, você DEVE usar a "anon public key" (JWT longo iniciando com eyJ...)
const supabaseKey = 'sb_publishable_l2haXZ3AN_U7ohXYLPTwGA_vU8VSV5T';

if (!supabaseKey || supabaseKey.startsWith('sb_')) {
  console.warn('⚠️ ALERTA: A chave do Supabase parece ser inválida para uso no cliente (Anon Key). Verifique se você copiou a "anon" public key em Settings > API.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

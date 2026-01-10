
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uusvorligoaffxbjxskr.supabase.co';
// Chave Anon Pública (JWT) fornecida pelo usuário
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1c3ZvcmxpZ29hZmZ4Ymp4c2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODQ4MDUsImV4cCI6MjA4MzA2MDgwNX0.cp2if1KayOXCoD7c4snkkyiWCXuKPW5rmblXYpkFnAI';

// Verificação de segurança em tempo de execução
if (!supabaseKey || supabaseKey.includes(' ')) {
  console.error('Erro Crítico: Supabase Key inválida ou com espaços.');
}

export const supabase = createClient(supabaseUrl, supabaseKey.trim());

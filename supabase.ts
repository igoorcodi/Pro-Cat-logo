
import { createClient } from '@supabase/supabase-js';

// URL derivada da referência encontrada na Anon Key (fccpazynhihxeikjxmbt)
const supabaseUrl = 'https://fccpazynhihxeikjxmbt.supabase.co';
// Nova Chave Anon Pública (JWT) fornecida pelo usuário
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjY3BhenluaGloeGVpa2p4bWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwODk5MjgsImV4cCI6MjA4MzY2NTkyOH0.ZXZ6dAakD9TA2pP0v0jG0XFfz7vPXnjzVzHam6DwRao';

// Verificação de segurança em tempo de execução
if (!supabaseKey || supabaseKey.includes(' ')) {
  console.error('Erro Crítico: Supabase Key inválida ou com espaços.');
}

export const supabase = createClient(supabaseUrl, supabaseKey.trim());

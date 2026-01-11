
import { createClient } from '@supabase/supabase-js';

/**
 * URL do Supabase corrigida conforme fornecido pelo usuário.
 * O Project Ref deve ser exatamente o mesmo do seu projeto no painel do Supabase.
 */
const supabaseUrl = 'https://omqvhteoytweqiudkbwy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXZodGVveXR3ZXFpdWRrYnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzkwNDIsImV4cCI6MjA4MzcxNTA0Mn0.BzJU6h9WixTViv-983OC2TwvG5cvxbj__oy1FGwhqo4';

// Criamos o cliente garantindo que a URL seja uma string válida para evitar o erro de construção de URL
export const supabase = createClient(supabaseUrl, supabaseKey.trim());

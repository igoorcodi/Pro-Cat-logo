-- Comando para adicionar a coluna de cor personalizada nos catálogos
ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5';

COMMENT ON COLUMN catalogs.primary_color IS 'Cor hexadecimal de identidade visual da vitrine pública';

-- TABELA DE HISTÓRICO DE ESTOQUE
CREATE TABLE IF NOT EXISTS stock_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'manual_adjustment', 'sale_delivery', 'return'
  reference_id TEXT, -- ID do orçamento ou código do ajuste
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_user ON stock_history(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para stock_history
CREATE POLICY "Users can insert their own stock history" 
ON stock_history FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view their own stock history" 
ON stock_history FOR SELECT 
TO authenticated 
USING (true);
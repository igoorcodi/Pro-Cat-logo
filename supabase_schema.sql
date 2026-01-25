
-- 1. ADICIONAR COLUNAS FALTANTES NA TABELA DE PEDIDOS DA VITRINE
-- Isso resolve o erro 'payment_method_name' not found
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS payment_method_name TEXT;
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS customer_id BIGINT;
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS total NUMERIC(10,2) DEFAULT 0;
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting';
ALTER TABLE showcase_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. CRIAR TABELA DE USO DE CUPONS (Caso ainda não exista)
-- Necessária para evitar que o mesmo cliente use o mesmo cupom várias vezes
CREATE TABLE IF NOT EXISTS customer_coupon_usage (
    id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    promotion_id BIGINT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, user_id)
);

-- 3. RE-DECLARAR FUNÇÃO DE ID SEQUENCIAL POR USUÁRIO
-- Garante que cada loja tenha seus próprios IDs começando do 1 (Pedido #1, #2...)
CREATE OR REPLACE FUNCTION get_next_id_by_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    EXECUTE format('SELECT coalesce(max(id), 0) + 1 FROM %I WHERE user_id = $1', TG_TABLE_NAME)
    INTO NEW.id
    USING NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CONFIGURAR SEGURANÇA (RLS) E POLÍTICAS DE ACESSO PÚBLICO
-- Habilitar RLS nas tabelas
ALTER TABLE showcase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupon_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para showcase_orders (Permite que clientes da vitrine enviem pedidos)
DROP POLICY IF EXISTS "Permitir inserção pública vitrine" ON showcase_orders;
CREATE POLICY "Permitir inserção pública vitrine" 
ON showcase_orders FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Dono visualiza pedidos" ON showcase_orders;
CREATE POLICY "Dono visualiza pedidos" 
ON showcase_orders FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Dono gerencia pedidos" ON showcase_orders;
CREATE POLICY "Dono gerencia pedidos" 
ON showcase_orders FOR UPDATE 
USING (true);

-- Políticas para customer_coupon_usage
DROP POLICY IF EXISTS "Permitir registro de uso de cupom" ON customer_coupon_usage;
CREATE POLICY "Permitir registro de uso de cupom" 
ON customer_coupon_usage FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Consultar uso de cupons" ON customer_coupon_usage;
CREATE POLICY "Consultar uso de cupons" 
ON customer_coupon_usage FOR SELECT 
USING (true);

-- 5. APLICAR GATILHOS DE AUTO-INCREMENTO POR USUÁRIO
DROP TRIGGER IF EXISTS trg_next_id_showcase_orders ON showcase_orders;
CREATE TRIGGER trg_next_id_showcase_orders 
BEFORE INSERT ON showcase_orders 
FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

DROP TRIGGER IF EXISTS trg_next_id_customer_coupon_usage ON customer_coupon_usage;
CREATE TRIGGER trg_next_id_customer_coupon_usage 
BEFORE INSERT ON customer_coupon_usage 
FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 6. GARANTIR QUE METADADOS DO CATÁLOGO EXISTAM (Evita erros de carregamento na vitrine)
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_title TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_subtitle TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS title_font_size TEXT DEFAULT 'lg';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS subtitle_font_size TEXT DEFAULT 'md';

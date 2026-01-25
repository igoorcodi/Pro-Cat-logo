
-- FUNÇÃO PARA GERAR PRÓXIMO ID BASEADO NO USER_ID
-- Usamos SECURITY DEFINER para garantir que o trigger tenha permissão de leitura mesmo com RLS ativo
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

-- 1. TABELA DE AUDITORIA
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    table_name TEXT NOT NULL,
    record_id BIGINT,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, user_id)
);

-- HABILITAR RLS NA AUDITORIA
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA AUDIT_LOGS
DROP POLICY IF EXISTS "Permitir inserção de logs por gatilhos" ON audit_logs;
CREATE POLICY "Permitir inserção de logs por gatilhos" 
ON audit_logs FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir visualização dos próprios logs" ON audit_logs;
CREATE POLICY "Permitir visualização dos próprios logs" 
ON audit_logs FOR SELECT 
USING (true);

DROP TRIGGER IF EXISTS trg_next_id_audit_logs ON audit_logs;
CREATE TRIGGER trg_next_id_audit_logs BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 2. FUNÇÃO DE TRIGGER DE AUDITORIA ATUALIZADA
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
    v_user_id BIGINT;
    v_record_id BIGINT;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_user_id := NEW.user_id;
        v_record_id := NEW.id;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        v_user_id := OLD.user_id;
        v_record_id := OLD.id;
    ELSIF (TG_OP = 'INSERT') THEN
        v_new_data := to_jsonb(NEW);
        v_user_id := NEW.user_id;
        v_record_id := NEW.id;
    END IF;

    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_record_id, TG_OP, v_old_data, v_new_data);

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. REESTRUTURAÇÃO DAS TABELAS (ADICIONADO SHOWCASE_ORDERS E COUPON_USAGE)
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'products', 
        'customers', 
        'catalogs', 
        'quotations', 
        'categories', 
        'subcategories', 
        'payment_methods', 
        'companies', 
        'showcase_orders', 
        'customer_coupon_usage',
        'promotions'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Ajuste de IDs e PKs
        EXECUTE format('ALTER TABLE %I ALTER COLUMN id DROP IDENTITY IF EXISTS', t);
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I_pkey CASCADE', t, t);
        EXECUTE format('ALTER TABLE %I ADD PRIMARY KEY (id, user_id)', t);
        
        -- Habilitar RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- Adicionar políticas básicas (Acesso anon para vitrine)
        EXECUTE format('DROP POLICY IF EXISTS "Acesso total anon" ON %I', t);
        EXECUTE format('CREATE POLICY "Acesso total anon" ON %I FOR ALL USING (true) WITH CHECK (true)', t);

        -- Triggers de Sequencial por Usuário
        EXECUTE format('DROP TRIGGER IF EXISTS trg_next_id_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_next_id_%I BEFORE INSERT ON %I FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user()', t, t);
        
        -- Trigger de Auditoria
        EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION process_audit_log()', t, t);
    END LOOP;
END $$;

-- 4. CORREÇÃO DE RELACIONAMENTOS (FK COMPOSTA)
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_fkey;
ALTER TABLE subcategories ADD CONSTRAINT subcategories_category_id_fkey 
    FOREIGN KEY (category_id, user_id) 
    REFERENCES categories(id, user_id) 
    ON DELETE CASCADE;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id, user_id) 
    REFERENCES categories(id, user_id) 
    ON DELETE SET NULL;

-- Garante que o slug seja único globalmente
ALTER TABLE catalogs DROP CONSTRAINT IF EXISTS catalogs_slug_key;
ALTER TABLE catalogs ADD CONSTRAINT catalogs_slug_key UNIQUE (slug);

-- Ajustes de Metadados
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_stock JSONB DEFAULT '{}'::jsonb;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_title TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_subtitle TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS title_font_size TEXT DEFAULT 'lg';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS subtitle_font_size TEXT DEFAULT 'md';

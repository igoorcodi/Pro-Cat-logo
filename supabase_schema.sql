
-- FUNÇÃO PARA GERAR PRÓXIMO ID BASEADO NO USER_ID
-- Esta função é dinâmica e funciona para qualquer tabela que tenha as colunas 'id' e 'user_id'
CREATE OR REPLACE FUNCTION get_next_id_by_user()
RETURNS TRIGGER AS $$
BEGIN
    EXECUTE format('SELECT coalesce(max(id), 0) + 1 FROM %I WHERE user_id = $1', TG_TABLE_NAME)
    INTO NEW.id
    USING NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- APLICAÇÃO EM TODAS AS TABELAS DO SISTEMA

-- 1. PRODUTOS
ALTER TABLE products ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey CASCADE;
ALTER TABLE products ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_products ON products;
CREATE TRIGGER trg_next_id_products BEFORE INSERT ON products FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 2. CLIENTES
ALTER TABLE customers ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_pkey CASCADE;
ALTER TABLE customers ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_customers ON customers;
CREATE TRIGGER trg_next_id_customers BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 3. CATÁLOGOS
ALTER TABLE catalogs ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE catalogs DROP CONSTRAINT IF EXISTS catalogs_pkey CASCADE;
ALTER TABLE catalogs ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_catalogs ON catalogs;
CREATE TRIGGER trg_next_id_catalogs BEFORE INSERT ON catalogs FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 4. ORÇAMENTOS
ALTER TABLE quotations ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_pkey CASCADE;
ALTER TABLE quotations ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_quotations ON quotations;
CREATE TRIGGER trg_next_id_quotations BEFORE INSERT ON quotations FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 5. CATEGORIAS
ALTER TABLE categories ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey CASCADE;
ALTER TABLE categories ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_categories ON categories;
CREATE TRIGGER trg_next_id_categories BEFORE INSERT ON categories FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 6. SUBCATEGORIAS
ALTER TABLE subcategories ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_pkey CASCADE;
ALTER TABLE subcategories ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_subcategories ON subcategories;
CREATE TRIGGER trg_next_id_subcategories BEFORE INSERT ON subcategories FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 7. FORMAS DE PAGAMENTO
ALTER TABLE payment_methods ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_pkey CASCADE;
ALTER TABLE payment_methods ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_payment_methods ON payment_methods;
CREATE TRIGGER trg_next_id_payment_methods BEFORE INSERT ON payment_methods FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- 8. EMPRESAS
ALTER TABLE companies ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_pkey CASCADE;
ALTER TABLE companies ADD PRIMARY KEY (id, user_id);
DROP TRIGGER IF EXISTS trg_next_id_companies ON companies;
CREATE TRIGGER trg_next_id_companies BEFORE INSERT ON companies FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- Ajustes de Metadados e Colunas Necessárias
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_image TEXT;

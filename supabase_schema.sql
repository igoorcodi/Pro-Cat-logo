
-- ==========================================
-- 1. LIMPEZA (OPCIONAL - CUIDADO)
-- ==========================================
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS customer_coupon_usage CASCADE;
-- DROP TABLE IF EXISTS showcase_orders CASCADE;
-- DROP TABLE IF EXISTS quotations CASCADE;
-- DROP TABLE IF EXISTS promotions CASCADE;
-- DROP TABLE IF EXISTS payment_methods CASCADE;
-- DROP TABLE IF EXISTS catalogs CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS subcategories CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- 2. EXTENSÕES E FUNÇÕES AUXILIARES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para gerar IDs sequenciais por usuário (Multi-tenant numbering)
CREATE OR REPLACE FUNCTION get_next_id_by_user()
RETURNS TRIGGER AS $$
BEGIN
    EXECUTE format('SELECT coalesce(max(id), 0) + 1 FROM %I WHERE user_id = $1', TG_TABLE_NAME)
    INTO NEW.id
    USING NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função de Auditoria Universal
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id int8;
BEGIN
    -- Tenta capturar o user_id do contexto (pode ser nulo em ações de sistema)
    BEGIN
        v_user_id := (current_setting('app.current_user_id'))::int8;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    END;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, created_at)
        VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD), now());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, created_at)
        VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW), now());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data, created_at)
        VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW), now());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. ESTRUTURA DE TABELAS (int8)
-- ==========================================

-- Tabela de Usuários (Gestão de Acesso e Multi-empresa)
CREATE TABLE users (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    owner_id int8 REFERENCES users(id), -- Null se for o Admin da Empresa
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'admin',
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    photo TEXT,
    phone TEXT,
    permissions JSONB DEFAULT '{
        "products": "edit",
        "customers": "edit",
        "categories": "edit",
        "promotions": "edit",
        "catalogs": "edit",
        "quotations": "edit"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Empresas (Dados de Identidade da Vitrine/Orçamentos)
CREATE TABLE companies (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trading_name TEXT,
    document TEXT,
    whatsapp TEXT,
    instagram TEXT,
    email TEXT,
    zip_code TEXT,
    address TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id) -- Uma empresa por conta admin
);

-- Categorias
CREATE TABLE categories (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Subcategorias
CREATE TABLE subcategories (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_id int8 NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Produtos
CREATE TABLE products (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id int8 REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_ids int8[] DEFAULT '{}', -- Array de IDs de subcategorias
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sku TEXT,
    stock INTEGER DEFAULT 0,
    subcategory_stock JSONB DEFAULT '{}'::jsonb, -- Estoque detalhado por variação
    images TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
    stock_history JSONB DEFAULT '[]'::jsonb, -- Cache do histórico (opcional)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Catálogos (Vitrines Digitais)
CREATE TABLE catalogs (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL, -- URL amigável
    description TEXT,
    cover_image TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    product_ids int8[] DEFAULT '{}',
    cover_title TEXT,
    cover_subtitle TEXT,
    title_font_size TEXT DEFAULT 'lg',
    subtitle_font_size TEXT DEFAULT 'md',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, slug) -- Slug único por empresa
);

-- Clientes (CRM)
CREATE TABLE customers (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password TEXT, -- Para login na vitrine
    document TEXT,
    zip_code TEXT,
    address TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Métodos de Pagamento Configuráveis
CREATE TABLE payment_methods (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fee_percentage NUMERIC(5, 2) DEFAULT 0,
    fixed_fee NUMERIC(10, 2) DEFAULT 0,
    show_in_cart BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Promoções e Cupons
CREATE TABLE promotions (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_discount_value NUMERIC(10, 2) DEFAULT 0,
    usage_limit INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    show_on_home BOOLEAN DEFAULT false,
    expiry_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Orçamentos (Quotation) - ID Sequencial por Usuário
CREATE TABLE quotations (
    id int8 NOT NULL, -- Atribuído via Trigger
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    seller_name TEXT,
    quotation_date DATE DEFAULT CURRENT_DATE,
    keyword TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'waiting',
    notes TEXT,
    payment_method_id int8 REFERENCES payment_methods(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- Pedidos da Vitrine (Showcase Orders) - ID Sequencial por Usuário
CREATE TABLE showcase_orders (
    id int8 NOT NULL, -- Atribuído via Trigger
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id int8 REFERENCES customers(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'waiting',
    notes TEXT,
    coupon_code TEXT,
    payment_method_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- Registro de uso de cupons por cliente
CREATE TABLE customer_coupon_usage (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id int8 NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    promotion_id int8 NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Auditoria Central
CREATE TABLE audit_logs (
    id int8 PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id int8 REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id int8 NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. GATILHOS (TRIGGERS)
-- ==========================================

-- Gatilhos para IDs Sequenciais
CREATE TRIGGER trg_seq_quotations BEFORE INSERT ON quotations FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();
CREATE TRIGGER trg_seq_showcase_orders BEFORE INSERT ON showcase_orders FOR EACH ROW EXECUTE FUNCTION get_next_id_by_user();

-- Gatilhos para Auditoria Automática
CREATE TRIGGER trg_audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER trg_audit_catalogs AFTER INSERT OR UPDATE OR DELETE ON catalogs FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER trg_audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER trg_audit_quotations AFTER INSERT OR UPDATE OR DELETE ON quotations FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER trg_audit_showcase_orders AFTER INSERT OR UPDATE OR DELETE ON showcase_orders FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- ==========================================
-- 5. SEGURANÇA (RLS) - EXEMPLO BÁSICO
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_orders ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem seus próprios produtos ou da empresa mãe
CREATE POLICY "Acesso Multiempresas Produtos" ON products
FOR ALL USING (
    user_id = auth.uid()::int8 OR 
    user_id IN (SELECT owner_id FROM users WHERE id = auth.uid()::int8)
);

-- ==========================================
-- 6. RPCs (FUNÇÕES REMOTAS)
-- ==========================================

-- Função para Login Seguro (Exemplo conforme usado no App)
CREATE OR REPLACE FUNCTION login_user(email_input TEXT, password_input TEXT)
RETURNS SETOF users AS $$
BEGIN
    RETURN QUERY 
    SELECT * FROM users 
    WHERE email = email_input 
    AND password = password_input -- Idealmente usar crypt() aqui
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para Criar Membro de Equipe
CREATE OR REPLACE FUNCTION create_team_member(
    p_name TEXT, p_email TEXT, p_password TEXT, p_admin_id int8, p_permissions JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO users (name, email, password, owner_id, role, permissions)
    VALUES (p_name, p_email, p_password, p_admin_id, 'editor', p_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

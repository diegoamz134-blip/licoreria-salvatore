-- ================================================================
-- LICORERÍA SALVATORE — SCHEMA V2 (PRODUCCIÓN)
-- Este archivo contiene la estructura mejorada y profesional.
-- ================================================================

-- 1. TABLA: categories (Categorías dinámicas)
CREATE TABLE IF NOT EXISTS public.categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: brands (Marcas para filtrado avanzado)
CREATE TABLE IF NOT EXISTS public.brands (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: products (Relacional y optimizada)
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  slug           TEXT UNIQUE,
  description    TEXT,
  price          NUMERIC NOT NULL CHECK (price >= 0),
  sale_price     NUMERIC CHECK (sale_price >= 0), -- Precio de oferta
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url      TEXT,
  category_id    INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id       INTEGER REFERENCES public.brands(id) ON DELETE SET NULL,
  is_active      BOOLEAN DEFAULT TRUE,
  is_featured    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 0. TABLA: profiles (Vínculo con Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role        VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  full_name   TEXT,
  phone       VARCHAR(50),
  address     TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. TABLA: orders (Gestión de ventas - Actualizada con user_id)
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Vínculo opcional para registrados
  customer_name    VARCHAR(255) NOT NULL,
  customer_phone   VARCHAR(50) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_cost    NUMERIC DEFAULT 0,
  total_amount     NUMERIC NOT NULL CHECK (total_amount >= 0),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending' 
                   CHECK (status IN ('pending', 'packing', 'shipped', 'completed', 'cancelled')),
  payment_method   VARCHAR(50), -- 'yape', 'plin', 'card', 'cash'
  evidence_url     TEXT,        -- URL del comprobante de pago (Yape/Plin)
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: order_items (Detalle de la venta)
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL, -- Guardamos el nombre por si el producto se borra
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time NUMERIC NOT NULL CHECK (price_at_time >= 0),
  unit_price    NUMERIC -- Precio unitario al momento de la compra
);

-- 6. TABLA: stock_movements (Kardex / Historial de inventario)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL, -- Positivo (entrada), Negativo (salida)
  reason      VARCHAR(50) CHECK (reason IN ('sale', 'restock', 'return', 'adjustment', 'damage')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone      ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_stock_product     ON public.stock_movements(product_id);

-- ================================================================
-- SEGURIDAD (RLS)
-- ================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PÚBLICAS (Tienda)
-- Cualquiera puede leer categorías, marcas y productos activos
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Brands"     ON public.brands     FOR SELECT USING (true);
CREATE POLICY "Public Read Products"   ON public.products   FOR SELECT USING (is_active = true);

-- Cualquiera puede crear una orden y sus items
CREATE POLICY "Public Insert Orders"      ON public.orders      FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

-- POLÍTICAS ADMINISTRATIVAS (Para el panel - Requiere Auth)
-- Por ahora, como estás configurando, podrías usar la API Key de servicio (Service Role)
-- pero lo ideal es que el admin se autentique y use estas políticas:

-- Ejemplo: solo usuarios autenticados pueden modificar productos
-- CREATE POLICY "Admin All Products" ON public.products FOR ALL TO authenticated USING (true);

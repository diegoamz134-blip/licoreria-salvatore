-- ================================================================
-- LICORERÍA SALVATORE — SUPABASE SCHEMA
-- Pegar este SQL en el SQL Editor de tu proyecto en Supabase
-- ================================================================

-- TABLA: products
CREATE TABLE products (
  id             UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(255)    NOT NULL,
  description    TEXT,
  price          DECIMAL(10, 2)  NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url      TEXT,
  category       VARCHAR(100),
  created_at     TIMESTAMPTZ     DEFAULT NOW()
);

-- TABLA: orders
CREATE TABLE orders (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name    VARCHAR(255)   NOT NULL,
  customer_phone   VARCHAR(50)    NOT NULL,
  delivery_address TEXT           NOT NULL,
  total_amount     DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status           VARCHAR(20)    NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'paid', 'delivered')),
  payment_method   VARCHAR(50),
  created_at       TIMESTAMPTZ    DEFAULT NOW()
);

-- TABLA: order_items
CREATE TABLE order_items (
  id            UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID           NOT NULL REFERENCES products(id),
  quantity      INTEGER        NOT NULL CHECK (quantity > 0),
  price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0)
);

-- ÍNDICES para performance
CREATE INDEX idx_products_category    ON products(category);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_created       ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product  ON order_items(product_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer productos
CREATE POLICY "public_read_products"
  ON products FOR SELECT USING (true);

-- Cualquiera puede crear una orden
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Cualquiera puede crear items de una orden
CREATE POLICY "public_insert_order_items"
  ON order_items FOR INSERT WITH CHECK (true);

-- ================================================================
-- DATOS DE EJEMPLO (opcional, para desarrollo)
-- ================================================================
INSERT INTO products (name, description, price, stock_quantity, image_url, category) VALUES
  ('Johnnie Walker Black',    'Scotch whisky 12 años. Ahumado, frutas secas y vainilla.',      89.90,  15, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', 'Whisky'),
  ('Absolut Vodka',           'Vodka sueco de trigo puro. Excepcionalmente suave.',            49.90,  25, 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&q=80', 'Vodka'),
  ('Havana Club 7 Años',      'Ron cubano añejo. Notas de caña, tabaco y madera dulce.',       65.00,  20, 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=400&q=80', 'Ron'),
  ('Bombay Sapphire',         'Gin londinense con 10 botánicos. Floral y cítrico.',            72.50,  18, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', 'Gin'),
  ('Moët & Chandon Imperial', 'Champagne brut francés. Elegante, fresco y burbujante.',       220.00,  8, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', 'Champagne'),
  ('Casillero del Diablo',    'Cabernet Sauvignon chileno. Tinto seco, afrutado, redondo.',    38.00,  30, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', 'Vino'),
  ('Chivas Regal 12',         'Blended Scotch whisky. Suave, con notas de miel y toffee.',    95.00,  12, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&q=80', 'Whisky'),
  ('Jack Daniel''s Old No.7', 'Tennessee whiskey. Suavizado con carbón de arce.',             79.90,  22, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', 'Whisky');

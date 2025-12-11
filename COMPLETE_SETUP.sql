-- COMPLETE SETUP FOR ORDERS SYSTEM - Copy-paste di Supabase SQL Editor
-- RUN IN ORDER: 1) Schema 2) Sample Data 3) Verification

-- ========================================
-- STEP 1: CREATE SCHEMA (if not exists)
-- ========================================

-- Drop and recreate cart_items table
DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  selected_size VARCHAR(10),
  session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_size)
);

-- Drop and recreate orders schema
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  notes TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  selected_size VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own customer records" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer records" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer records" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

SELECT 'STEP 1: Schema created successfully' as status;

-- ========================================
-- STEP 2: INSERT SAMPLE DATA
-- ========================================

-- Sample customers (without user_id for now)
INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Ahmad', 'Rizki', 'ahmad@example.com', '08123456789'),
('550e8400-e29b-41d4-a716-446655440102', 'Siti', 'Nurhaliza', 'siti@example.com', '08234567890'),
('550e8400-e29b-41d4-a716-446655440103', 'Budi', 'Santoso', 'budi@example.com', '08345678901')
ON CONFLICT (email) DO NOTHING;

-- Sample orders
INSERT INTO orders (id, customer_id, order_number, status, payment_status, total_amount, shipping_address, billing_address, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 'ORD2025001', 'pending', 'pending', 299000.00, 
'{"street": "Jl. Merdeka No. 123", "city": "Jakarta", "postal_code": "12345", "phone": "08123456789"}',
'{"street": "Jl. Merdeka No. 123", "city": "Jakarta", "postal_code": "12345", "phone": "08123456789"}',
NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440102', 'ORD2025002', 'confirmed', 'paid', 749000.00,
'{"street": "Jl. Sudirman No. 456", "city": "Bandung", "postal_code": "40123", "phone": "08234567890"}',
'{"street": "Jl. Sudirman No. 456", "city": "Bandung", "postal_code": "40123", "phone": "08234567890"}',
NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440103', 'ORD2025003', 'processing', 'paid', 1500000.00,
'{"street": "Jl. Gatot Subroto No. 789", "city": "Surabaya", "postal_code": "60234", "phone": "08345678901"}',
'{"street": "Jl. Gatot Subroto No. 789", "city": "Surabaya", "postal_code": "60234", "phone": "08345678901"}',
NOW() - INTERVAL '3 hours')
ON CONFLICT (order_number) DO NOTHING;

-- Sample order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Hitam', 1, 299000.00, 299000.00, 'L'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Kaos Putih', 2, 149000.00, 298000.00, 'M'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440003', 'Jeans Pria Biru', 1, 399000.00, 399000.00, '32'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440005', 'Blazer Biru', 1, 599000.00, 599000.00, 'L'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440006', 'Casual Sneakers', 1, 599000.00, 599000.00, '42'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440004', 'Denim Biru', 1, 349000.00, 349000.00, '34')
ON CONFLICT DO NOTHING;

SELECT 'STEP 2: Sample data inserted successfully' as status;

-- ========================================
-- STEP 3: VERIFICATION
-- ========================================

-- Check counts
SELECT 
  (SELECT COUNT(*) FROM customers) as customer_count,
  (SELECT COUNT(*) FROM orders) as order_count,
  (SELECT COUNT(*) FROM order_items) as item_count;

-- Show orders with customer info
SELECT 
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  c.first_name || ' ' || c.last_name as customer_name,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, customer_name
ORDER BY o.created_at DESC;

SELECT 'STEP 3: Verification complete - Orders are ready!' as status;

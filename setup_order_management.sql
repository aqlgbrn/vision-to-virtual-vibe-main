-- SETUP ORDER MANAGEMENT FOR ADMIN DASHBOARD
-- Run this script in Supabase SQL Editor to enable order management

-- Step 1: Ensure order statuses table exists and has data
CREATE TABLE IF NOT EXISTS order_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT 'gray',
  sequence_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert order statuses if they don't exist
INSERT INTO order_statuses (name, display_name, description, color, sequence_order, is_default) VALUES
('pending', 'Menunggu Pembayaran', 'Menunggu konfirmasi pembayaran dari customer', 'gray', 1, true),
('paid', 'Sudah Dibayar', 'Pembayaran telah dikonfirmasi (COD)', 'blue', 2, false),
('confirmed', 'Dikonfirmasi', 'Pesanan telah dikonfirmasi oleh admin', 'blue', 3, false),
('processing', 'Diproses', 'Pesanan sedang diproses', 'yellow', 4, false),
('shipped', 'Dikirim', 'Pesanan telah dikirim ke alamat customer', 'orange', 5, false),
('delivered', 'Diterima', 'Pesanan telah diterima customer', 'green', 6, false),
('cancelled', 'Dibatalkan', 'Pesanan dibatalkan oleh customer atau admin', 'red', 7, false),
('refunded', 'Dikembalikan', 'Pembayaran dikembalikan', 'red', 8, false)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create sample orders if they don't exist
INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Ahmad', 'Rizki', 'ahmad@example.com', '08123456789'),
('550e8400-e29b-41d4-a716-446655440102', 'Siti', 'Nurhaliza', 'siti@example.com', '08234567890'),
('550e8400-e29b-41d4-a716-446655440103', 'Budi', 'Santoso', 'budi@example.com', '08345678901')
ON CONFLICT (email) DO NOTHING;

-- Create sample orders with different statuses
INSERT INTO orders (id, customer_id, order_number, status, payment_status, payment_method, subtotal, tax, shipping_cost, total_amount, shipping_address, billing_address, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 'ORD2025001', 'pending', 'pending', 'COD', 284000.00, 28400.00, 15000.00, 327400.00, 
'{"street": "Jl. Merdeka No. 123", "city": "Jakarta", "postal_code": "12345", "phone": "08123456789"}',
'{"street": "Jl. Merdeka No. 123", "city": "Jakarta", "postal_code": "12345", "phone": "08123456789"}',
NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440102', 'ORD2025002', 'confirmed', 'paid', 'COD', 734000.00, 73400.00, 15000.00, 822400.00,
'{"street": "Jl. Sudirman No. 456", "city": "Bandung", "postal_code": "40123", "phone": "08234567890"}',
'{"street": "Jl. Sudirman No. 456", "city": "Bandung", "postal_code": "40123", "phone": "08234567890"}',
NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440103', 'ORD2025003', 'processing', 'paid', 'COD', 1485000.00, 148500.00, 15000.00, 1648500.00,
'{"street": "Jl. Gatot Subroto No. 789", "city": "Surabaya", "postal_code": "60234", "phone": "08345678901"}',
'{"street": "Jl. Gatot Subroto No. 789", "city": "Surabaya", "postal_code": "60234", "phone": "08345678901"}',
NOW() - INTERVAL '3 hours')
ON CONFLICT (order_number) DO NOTHING;

-- Create sample order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Hitam', 1, 299000.00, 299000.00, 'L'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Kaos Putih', 2, 149000.00, 298000.00, 'M'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440003', 'Jeans Pria Biru', 1, 399000.00, 399000.00, '32'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440005', 'Blazer Biru', 1, 599000.00, 599000.00, 'L'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440006', 'Casual Sneakers', 1, 599000.00, 599000.00, '42'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440004', 'Denim Biru', 1, 349000.00, 349000.00, '34')
ON CONFLICT DO NOTHING;

-- Step 3: Enable RLS policies for admin access
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Order statuses are viewable by everyone" ON order_statuses;

-- Create admin policies for order management
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "Admins can view all customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Order statuses are viewable by everyone" ON order_statuses
    FOR SELECT USING (true);

-- Step 4: Verification
SELECT 'Setup completed successfully!' as status;

-- Show sample data
SELECT 
  o.order_number,
  o.status,
  o.payment_status,
  o.payment_method,
  o.total_amount,
  c.first_name || ' ' || c.last_name as customer_name,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.payment_method, o.total_amount, customer_name
ORDER BY o.created_at DESC;

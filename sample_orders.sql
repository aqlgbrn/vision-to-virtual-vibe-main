-- Sample Orders for Testing - Copy-paste di Supabase SQL Editor

-- First, create sample customers (without user_id for now)
INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Ahmad', 'Rizki', 'ahmad@example.com', '08123456789'),
('550e8400-e29b-41d4-a716-446655440102', 'Siti', 'Nurhaliza', 'siti@example.com', '08234567890'),
('550e8400-e29b-41d4-a716-446655440103', 'Budi', 'Santoso', 'budi@example.com', '08345678901')
ON CONFLICT (email) DO NOTHING;

-- Create sample orders (without user_id for now)
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

-- Create sample order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Hitam', 1, 299000.00, 299000.00, 'L'),

('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'Kaos Putih', 2, 149000.00, 298000.00, 'M'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440003', 'Jeans Pria Biru', 1, 399000.00, 399000.00, '32'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440005', 'Blazer Biru', 1, 599000.00, 599000.00, 'L'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440006', 'Casual Sneakers', 1, 599000.00, 599000.00, '42'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440004', 'Denim Biru', 1, 349000.00, 349000.00, '34')
ON CONFLICT DO NOTHING;

-- Verify data insertion
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

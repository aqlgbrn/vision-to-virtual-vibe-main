-- Sample Data for Dashboard
-- Insert sample categories
INSERT INTO categories (id, name, slug, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Pakaian Pria', 'pakaian-pria', 'Koleksi pakaian fashion untuk pria'),
('550e8400-e29b-41d4-a716-446655440002', 'Pakaian Wanita', 'pakaian-wanita', 'Koleksi pakaian fashion untuk wanita'),
('550e8400-e29b-41d4-a716-446655440003', 'Aksesoris', 'aksesoris', 'Aksesoris fashion lengkap'),
('550e8400-e29b-41d4-a716-446655440004', 'Sepatu', 'sepatu', 'Koleksi sepatu stylish');

-- Insert sample products
INSERT INTO products (id, name, slug, description, price, compare_price, sku, quantity, category_id, status, featured, tags) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Kemeja Casual', 'kemeja-casual', 'Kemeja casual nyaman untuk sehari-hari', 289000, 350000, 'KCM-001', 50, '550e8400-e29b-41d4-a716-446655440001', 'active', true, ARRAY['casual', 'pria', 'kemeja']),
('660e8400-e29b-41d4-a716-446655440002', 'Dress Party', 'dress-party', 'Dress elegan untuk acara spesial', 450000, 550000, 'DRS-001', 30, '550e8400-e29b-41d4-a716-446655440002', 'active', true, ARRAY['dress', 'wanita', 'party']),
('660e8400-e29b-41d4-a716-446655440003', 'Jaket Jeans', 'jaket-jeans', 'Jaket jeans stylish dan tahan lama', 350000, 450000, 'JKT-001', 25, '550e8400-e29b-41d4-a716-446655440001', 'active', false, ARRAY['jaket', 'pria', 'jeans']),
('660e8400-e29b-41d4-a716-446655440004', 'Tunik Modern', 'tunik-modern', 'Tunik modern dengan desain trendy', 195000, 250000, 'TNK-001', 40, '550e8400-e29b-41d4-a716-446655440002', 'active', false, ARRAY['tunik', 'wanita', 'modern']),
('660e8400-e29b-41d4-a716-446655440005', 'Kaos Polos', 'kaos-polos', 'Kaos polos berkualitas tinggi', 99000, 150000, 'KOS-001', 100, '550e8400-e29b-41d4-a716-446655440001', 'active', false, ARRAY['kaos', 'pria', 'polos']),
('660e8400-e29b-41d4-a716-446655440006', 'Rok Mini', 'rok-mini', 'Rok mini casual dan stylish', 175000, 220000, 'ROK-001', 35, '550e8400-e29b-41d4-a716-446655440002', 'active', false, ARRAY['rok', 'wanita', 'mini']),
('660e8400-e29b-41d4-a716-446655440007', 'Sepatu Sneakers', 'sepatu-sneakers', 'Sneakers nyaman untuk aktivitas harian', 450000, 550000, 'SPT-001', 20, '550e8400-e29b-41d4-a716-446655440004', 'active', true, ARRAY['sepatu', 'sneakers', 'unisex']),
('660e8400-e29b-41d4-a716-446655440008', 'Tas Selempang', 'tas-selempang', 'Tas selempang praktis dan modis', 225000, 300000, 'TAS-001', 45, '550e8400-e29b-41d4-a716-446655440003', 'active', false, ARRAY['tas', 'aksesoris', 'selempang']);

-- Insert sample customers
INSERT INTO customers (id, user_id, first_name, last_name, email, phone, address, city, province, postal_code, total_orders, total_spent) VALUES
('770e8400-e29b-41d4-a716-446655440001', NULL, 'Ahmad', 'Rizki', 'ahmad.rizki@email.com', '08123456789', 'Jl. Merdeka No. 123', 'Jakarta', 'DKI Jakarta', '12345', 5, 1450000),
('770e8400-e29b-41d4-a716-446655440002', NULL, 'Siti', 'Nurhaliza', 'siti.nurhaliza@email.com', '08234567890', 'Jl. Sudirman No. 456', 'Bandung', 'Jawa Barat', '40115', 3, 1350000),
('770e8400-e29b-41d4-a716-446655440003', NULL, 'Budi', 'Santoso', 'budi.santoso@email.com', '08345678901', 'Jl. Gatot Subroto No. 789', 'Surabaya', 'Jawa Timur', '60211', 2, 700000),
('770e8400-e29b-41d4-a716-446655440004', NULL, 'Dewi', 'Lestari', 'dewi.lestari@email.com', '08456789012', 'Jl. Teuku Umar No. 321', 'Yogyakarta', 'DI Yogyakarta', '55222', 4, 780000),
('770e8400-e29b-41d4-a716-446655440005', NULL, 'Eko', 'Prasetyo', 'eko.prasetyo@email.com', '08567890123', 'Jl. Pahlawan No. 654', 'Medan', 'Sumatera Utara', '20112', 1, 289000),
('770e8400-e29b-41d4-a716-446655440006', NULL, 'Rina', 'Wati', 'rina.wati@email.com', '08678901234', 'Jl. Diponegoro No. 987', 'Semarang', 'Jawa Tengah', '50133', 6, 2100000),
('770e8400-e29b-41d4-a716-446655440007', NULL, 'Fajar', 'Setiawan', 'fajar.setiawan@email.com', '08789012345', 'Jl. Ahmad Yani No. 147', 'Palembang', 'Sumatera Selatan', '30114', 2, 645000),
('770e8400-e29b-41d4-a716-446655440008', NULL, 'Maya', 'Sari', 'maya.sari@email.com', '08890123456', 'Jl. Sudirman No. 258', 'Makassar', 'Sulawesi Selatan', '90115', 3, 1045000);

-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, status, payment_status, payment_method, subtotal, tax, shipping_cost, discount_amount, total_amount, notes, shipping_address, billing_address) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'ORD1735670400', '770e8400-e29b-41d4-a716-446655440001', 'delivered', 'paid', 'transfer', 289000, 28900, 15000, 0, 332900, 'Packing aman', '{"street":"Jl. Merdeka No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}', '{"street":"Jl. Merdeka No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}'),
('880e8400-e29b-41d4-a716-446655440002', 'ORD1735670500', '770e8400-e29b-41d4-a716-446655440002', 'processing', 'paid', 'ewallet', 450000, 45000, 20000, 22500, 492500, 'Harap dikirim segera', '{"street":"Jl. Sudirman No. 456","city":"Bandung","province":"Jawa Barat","postal_code":"40115"}', '{"street":"Jl. Sudirman No. 456","city":"Bandung","province":"Jawa Barat","postal_code":"40115"}'),
('880e8400-e29b-41d4-a716-446655440003', 'ORD1735670600', '770e8400-e29b-41d4-a716-446655440003', 'shipped', 'paid', 'transfer', 350000, 35000, 18000, 0, 403000, 'COD tidak tersedia', '{"street":"Jl. Gatot Subroto No. 789","city":"Surabaya","province":"Jawa Timur","postal_code":"60211"}', '{"street":"Jl. Gatot Subroto No. 789","city":"Surabaya","province":"Jawa Timur","postal_code":"60211"}'),
('880e8400-e29b-41d4-a716-446655440004', 'ORD1735670700', '770e8400-e29b-41d4-a716-446655440004', 'pending', 'pending', 'transfer', 195000, 19500, 12000, 0, 226500, 'Konfirmasi pembayaran', '{"street":"Jl. Teuku Umar No. 321","city":"Yogyakarta","province":"DI Yogyakarta","postal_code":"55222"}', '{"street":"Jl. Teuku Umar No. 321","city":"Yogyakarta","province":"DI Yogyakarta","postal_code":"55222"}'),
('880e8400-e29b-41d4-a716-446655440005', 'ORD1735670800', '770e8400-e29b-41d4-a716-446655440005', 'delivered', 'paid', 'ewallet', 289000, 28900, 15000, 0, 332900, 'Fast shipping', '{"street":"Jl. Pahlawan No. 654","city":"Medan","province":"Sumatera Utara","postal_code":"20112"}', '{"street":"Jl. Pahlawan No. 654","city":"Medan","province":"Sumatera Utara","postal_code":"20112"}'),
('880e8400-e29b-41d4-a716-446655440006', 'ORD1735670900', '770e8400-e29b-41d4-a716-446655440006', 'delivered', 'paid', 'transfer', 450000, 45000, 20000, 0, 515000, 'Gift wrap please', '{"street":"Jl. Diponegoro No. 987","city":"Semarang","province":"Jawa Tengah","postal_code":"50133"}', '{"street":"Jl. Diponegoro No. 987","city":"Semarang","province":"Jawa Tengah","postal_code":"50133"}'),
('880e8400-e29b-41d4-a716-446655440007', 'ORD1735671000', '770e8400-e29b-41d4-a716-446655440007', 'confirmed', 'paid', 'ewallet', 350000, 35000, 18000, 0, 403000, 'Urgent', '{"street":"Jl. Ahmad Yani No. 147","city":"Palembang","province":"Sumatera Selatan","postal_code":"30114"}', '{"street":"Jl. Ahmad Yani No. 147","city":"Palembang","province":"Sumatera Selatan","postal_code":"30114"}'),
('880e8400-e29b-41d4-a716-446655440008', 'ORD1735671100', '770e8400-e29b-41d4-a716-446655440008', 'processing', 'paid', 'transfer', 450000, 45000, 20000, 22500, 492500, 'Customer request', '{"street":"Jl. Sudirman No. 258","city":"Makassar","province":"Sulawesi Selatan","postal_code":"90115"}', '{"street":"Jl. Sudirman No. 258","city":"Makassar","province":"Sulawesi Selatan","postal_code":"90115"}');

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, product_name, product_sku) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 289000, 289000, 'Kemeja Casual', 'KCM-001'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1, 450000, 450000, 'Dress Party', 'DRS-001'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 1, 350000, 350000, 'Jaket Jeans', 'JKT-001'),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 1, 195000, 195000, 'Tunik Modern', 'TNK-001'),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 1, 289000, 289000, 'Kemeja Casual', 'KCM-001'),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 1, 450000, 450000, 'Dress Party', 'DRS-001'),
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 1, 350000, 350000, 'Jaket Jeans', 'JKT-001'),
('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440007', 1, 450000, 450000, 'Sepatu Sneakers', 'SPT-001');

-- Create some additional orders for better statistics
INSERT INTO orders (id, order_number, customer_id, status, payment_status, payment_method, subtotal, tax, shipping_cost, discount_amount, total_amount, shipping_address, billing_address, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440009', 'ORD1735671200', '770e8400-e29b-41d4-a716-446655440001', 'delivered', 'paid', 'transfer', 578000, 57800, 30000, 0, 665800, '{"street":"Jl. Merdeka No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}', '{"street":"Jl. Merdeka No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}', NOW() - INTERVAL '15 days'),
('880e8400-e29b-41d4-a716-446655440010', 'ORD1735671300', '770e8400-e29b-41d4-a716-446655440002', 'delivered', 'paid', 'ewallet', 900000, 90000, 40000, 45000, 985000, '{"street":"Jl. Sudirman No. 456","city":"Bandung","province":"Jawa Barat","postal_code":"40115"}', '{"street":"Jl. Sudirman No. 456","city":"Bandung","province":"Jawa Barat","postal_code":"40115"}', NOW() - INTERVAL '10 days'),
('880e8400-e29b-41d4-a716-446655440011', 'ORD1735671400', '770e8400-e29b-41d4-a716-446655440003', 'delivered', 'paid', 'transfer', 350000, 35000, 18000, 0, 403000, '{"street":"Jl. Gatot Subroto No. 789","city":"Surabaya","province":"Jawa Timur","postal_code":"60211"}', '{"street":"Jl. Gatot Subroto No. 789","city":"Surabaya","province":"Jawa Timur","postal_code":"60211"}', NOW() - INTERVAL '8 days'),
('880e8400-e29b-41d4-a716-446655440012', 'ORD1735671500', '770e8400-e29b-41d4-a716-446655440004', 'delivered', 'paid', 'transfer', 390000, 39000, 24000, 0, 453000, '{"street":"Jl. Teuku Umar No. 321","city":"Yogyakarta","province":"DI Yogyakarta","postal_code":"55222"}', '{"street":"Jl. Teuku Umar No. 321","city":"Yogyakarta","province":"DI Yogyakarta","postal_code":"55222"}', NOW() - INTERVAL '5 days');

-- Additional order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, product_name, product_sku) VALUES
('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 2, 289000, 578000, 'Kemeja Casual', 'KCM-001'),
('990e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 2, 450000, 900000, 'Dress Party', 'DRS-001'),
('990e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', 1, 350000, 350000, 'Jaket Jeans', 'JKT-001'),
('990e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440004', 2, 195000, 390000, 'Tunik Modern', 'TNK-001');

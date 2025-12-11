-- Test Data for Dashboard
-- Simple test data to make dashboard functional

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Fashion', 'fashion', 'Pakaian dan aksesoris fashion'),
('Elektronik', 'elektronik', 'Perangkat elektronik dan gadget'),
('Makanan', 'makanan', 'Makanan dan minuman');

-- Insert sample products
INSERT INTO products (name, slug, description, price, status, category, sku, quantity, images) VALUES
('Kemeja Casual', 'kemeja-casual', 'Kemeja casual untuk pria', 150000, 'active', 'Fashion', 'KMJ-001', 50, '{"https://example.com/kemeja1.jpg"}'),
('Dress Wanita', 'dress-wanita', 'Dress elegan untuk wanita', 250000, 'active', 'Fashion', 'DRS-001', 30, '{"https://example.com/dress1.jpg"}'),
('Smartphone Android', 'smartphone-android', 'HP Android terbaru', 3000000, 'active', 'Elektronik', 'SMP-001', 20, '{"https://example.com/phone1.jpg"}'),
('Laptop Gaming', 'laptop-gaming', 'Laptop untuk gaming', 15000000, 'active', 'Elektronik', 'LTP-001', 10, '{"https://example.com/laptop1.jpg"}');

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, user_id) VALUES
('Ahmad', 'Rizki', 'ahmad@email.com', '081234567890', '00000000-0000-0000-0000-000000000001'),
('Siti', 'Nurhaliza', 'siti@email.com', '081234567891', '00000000-0000-0000-0000-000000000002'),
('Budi', 'Santoso', 'budi@email.com', '081234567892', '00000000-0000-0000-0000-000000000003');

-- Insert sample orders
INSERT INTO orders (order_number, user_id, customer_id, status, payment_status, total_amount, shipping_address, billing_address) VALUES
('ORD0000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'pending', 'pending', 150000, '{"street":"Jl. Sudirman No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}', '{"street":"Jl. Sudirman No. 123","city":"Jakarta","province":"DKI Jakarta","postal_code":"12345"}'),
('ORD0000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'processing', 'paid', 250000, '{"street":"Jl. Gatot Subroto No. 456","city":"Jakarta","province":"DKI Jakarta","postal_code":"12346"}', '{"street":"Jl. Gatot Subroto No. 456","city":"Jakarta","province":"DKI Jakarta","postal_code":"12346"}'),
('ORD0000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'completed', 'paid', 3000000, '{"street":"Jl. Thamrin No. 789","city":"Jakarta","province":"DKI Jakarta","postal_code":"12347"}', '{"street":"Jl. Thamrin No. 789","city":"Jakarta","province":"DKI Jakarta","postal_code":"12347"}');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Kemeja Casual', 1, 150000, 150000),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Dress Wanita', 1, 250000, 250000),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Smartphone Android', 1, 3000000, 3000000);

-- Insert order statuses
INSERT INTO order_statuses (name, display_name, description) VALUES
('pending', 'Menunggu Pembayaran', 'Pesanan menunggu pembayaran dari pelanggan'),
('paid', 'Dibayar', 'Pembayaran telah dikonfirmasi'),
('processing', 'Diproses', 'Pesanan sedang diproses'),
('shipped', 'Dikirim', 'Pesanan sedang dalam pengiriman'),
('delivered', 'Terkirim', 'Pesanan telah diterima pelanggan'),
('cancelled', 'Dibatalkan', 'Pesanan dibatalkan');

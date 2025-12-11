-- FIX ORDER SYNCHRONIZATION - Jalankan di Supabase SQL Editor

-- Step 1: Hapus data lama yang mungkin conflict
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);

-- Step 2: Pastikan order items terhubung dengan benar
UPDATE order_items SET 
  product_name = COALESCE(product_name, 'Produk'),
  unit_price = COALESCE(unit_price, 0),
  total_price = COALESCE(total_price, 0),
  quantity = COALESCE(quantity, 1)
WHERE product_name IS NULL OR unit_price IS NULL OR total_price IS NULL;

-- Step 3: Insert order items yang hilang (jika ada)
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size)
SELECT 
  gen_random_uuid(),
  o.id,
  '550e8400-e29b-41d4-a716-446655440001',
  'Kemeja Hitam',
  1,
  299000.00,
  299000.00,
  'L'
FROM orders o 
WHERE o.order_number = 'ORD2025001' 
AND NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
);

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size)
SELECT 
  gen_random_uuid(),
  o.id,
  '550e8400-e29b-41d4-a716-446655440002',
  'Kaos Putih',
  2,
  149000.00,
  298000.00,
  'M'
FROM orders o 
WHERE o.order_number = 'ORD2025002' 
AND NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
);

INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, selected_size)
SELECT 
  gen_random_uuid(),
  o.id,
  '550e8400-e29b-41d4-a716-446655440003',
  'Jeans Pria Biru',
  1,
  399000.00,
  399000.00,
  '32'
FROM orders o 
WHERE o.order_number = 'ORD2025003' 
AND NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
);

-- Step 4: Verifikasi data
SELECT 
  'VERIFIKASI DATA' as info,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM order_items) as total_items,
  (SELECT COUNT(*) FROM customers) as total_customers;

-- Step 5: Show orders with items
SELECT 
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  c.first_name || ' ' || c.last_name as customer_name,
  COUNT(oi.id) as item_count,
  STRING_AGG(oi.product_name || ' (' || oi.quantity || 'x)', ', ') as items_list
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id  
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, customer_name
ORDER BY o.created_at DESC;

SELECT 'Data synchronization completed!' as status;

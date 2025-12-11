-- COMPLETE CHECK - Jalankan di Supabase SQL Editor
-- Ini akan menunjukkan semua data yang ada

-- 1. Cek semua tabel
SELECT '=== TABEL CHECK ===' as info;
SELECT 
  'orders' as table_name, 
  COUNT(*) as count,
  (SELECT MAX(created_at) FROM orders) as latest_date
UNION ALL
SELECT 'customers', COUNT(*), (SELECT MAX(created_at) FROM customers)
UNION ALL  
SELECT 'order_items', COUNT(*), (SELECT MAX(created_at) FROM order_items)
UNION ALL
SELECT 'order_statuses', COUNT(*), (SELECT MAX(created_at) FROM order_statuses);

-- 2. Lihat semua orders dengan detail
SELECT '=== ORDERS DETAIL ===' as info;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  o.created_at,
  c.first_name,
  c.last_name,
  c.email
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id  
ORDER BY o.created_at DESC;

-- 3. Lihat semua order items
SELECT '=== ORDER ITEMS ===' as info;
SELECT 
  oi.id,
  oi.order_id,
  o.order_number,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.selected_size
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC;

-- 4. Cek hubungan orders dengan items
SELECT '=== ORDERS WITH ITEMS COUNT ===' as info;
SELECT 
  o.order_number,
  o.status,
  COUNT(oi.id) as item_count,
  STRING_AGG(oi.product_name, ', ') as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status
ORDER BY o.created_at DESC;

SELECT 'Check completed!' as status;

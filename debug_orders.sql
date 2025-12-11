-- DEBUG ORDERS - Check what's in the database
-- Run this in Supabase SQL Editor to see what data exists

-- Check if orders table exists and has data
SELECT 'ORDERS TABLE' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'CUSTOMERS TABLE', COUNT(*) FROM customers
UNION ALL  
SELECT 'ORDER_ITEMS TABLE', COUNT(*) FROM order_items
UNION ALL
SELECT 'ORDER_STATUSES TABLE', COUNT(*) FROM order_statuses;

-- Show sample orders with all details
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.payment_status,
  o.total_amount,
  o.created_at,
  c.first_name,
  c.last_name,
  c.email,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id  
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, o.created_at, c.first_name, c.last_name, c.email
ORDER BY o.created_at DESC
LIMIT 5;

-- Show order items for each order
SELECT 
  o.order_number,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.selected_size
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.created_at DESC, oi.id
LIMIT 10;

-- Check if RLS policies are blocking access
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'customers', 'order_items', 'order_statuses');

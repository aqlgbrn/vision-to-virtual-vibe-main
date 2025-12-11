-- Check if orders exist - Copy-paste di Supabase SQL Editor

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'customers', 'order_items')
ORDER BY table_name;

-- Check customers count
SELECT COUNT(*) as customer_count FROM customers;

-- Check orders count  
SELECT COUNT(*) as order_count FROM orders;

-- Check order items count
SELECT COUNT(*) as item_count FROM order_items;

-- Show all orders with customer info
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

-- Show order items with product info
SELECT 
  oi.id,
  oi.order_id,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.selected_size,
  o.order_number
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
ORDER BY o.order_number, oi.product_name;

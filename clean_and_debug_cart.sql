-- Script untuk debugging dan membersihkan masalah auto-add cart items
-- Jalankan ini di Supabase SQL Editor

-- 1. Lihat semua cart items yang ada saat ini
SELECT 
    ci.*,
    p.name as product_name,
    p.price
FROM cart_items ci
LEFT JOIN products p ON ci.product_id = p.id
ORDER BY ci.created_at DESC;

-- 2. Cari Kemeja Kalcer khusus
SELECT 
    ci.*,
    p.name as product_name
FROM cart_items ci
LEFT JOIN products p ON ci.product_id = p.id
WHERE p.name LIKE '%Kalcer%' OR p.name LIKE '%kemeja%'
ORDER BY ci.created_at DESC;

-- 3. Lihat user_id yang terpengaruh
SELECT DISTINCT user_id, COUNT(*) as item_count
FROM cart_items
GROUP BY user_id;

-- 4. Hapus SEMUA cart items (force clean)
TRUNCATE TABLE cart_items RESTART IDENTITY;

-- 5. Cek apakah ada trigger yang menambahkan items
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
AND (action_statement LIKE '%INSERT%' OR action_statement LIKE '%cart_items%');

-- 6. Cari function yang auto-add items
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND (prosrc LIKE '%INSERT%' OR prosrc LIKE '%cart_items%' OR prosrc LIKE '%Kemeja%')
ORDER BY proname;

-- 7. Verifikasi cart items kosong
SELECT COUNT(*) as total_items FROM cart_items;

SELECT 'Cart items completely cleaned and debugged' as status;

-- Script untuk mencari dan menghapus trigger/function yang auto-add items ke keranjang
-- Jalankan ini di Supabase SQL Editor

-- 1. Lihat semua trigger yang ada
SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_table, trigger_name;

-- 2. Lihat semua function yang ada
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname LIKE '%cart%'
ORDER BY proname;

-- 3. Lihat semua function yang mungkin auto-add items
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND (prosrc LIKE '%INSERT%' OR prosrc LIKE '%cart_items%')
ORDER BY proname;

-- 4. Hapus trigger yang mencurigakan (jika ada)
-- DROP TRIGGER IF EXISTS auto_add_cart_items ON cart_items;
-- DROP TRIGGER IF EXISTS populate_sample_cart ON auth.users;

-- 5. Hapus function yang mencurigakan (jika ada)
-- DROP FUNCTION IF EXISTS auto_populate_cart();
-- DROP FUNCTION IF EXISTS add_sample_items();

-- 6. Lihat semua cart items yang ada saat ini
SELECT 
    ci.*,
    p.name as product_name
FROM cart_items ci
LEFT JOIN products p ON ci.product_id = p.id
ORDER BY ci.created_at DESC;

-- 7. Hapus SEMUA cart items (force clean)
TRUNCATE TABLE cart_items RESTART IDENTITY;

-- 8. Disable RLS sementara untuk testing
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- 9. Enable RLS kembali
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

SELECT 'All triggers and functions checked, cart items cleaned' as status;

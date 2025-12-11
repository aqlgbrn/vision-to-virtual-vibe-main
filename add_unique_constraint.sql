-- Script untuk menambahkan unique constraint pada user_id di tabel customers
-- Jalankan ini di Supabase SQL Editor

-- 1. Lihat struktur tabel customers
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Lihat constraint yang sudah ada
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'customers'
AND tc.table_schema = 'public';

-- 3. Hapus constraint yang mungkin bentrok (jika ada)
-- ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_user_id_key;

-- 4. Tambahkan unique constraint pada user_id
ALTER TABLE customers 
ADD CONSTRAINT customers_user_id_key 
UNIQUE (user_id);

-- 5. Verifikasi constraint sudah ditambahkan
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'customers'
AND constraint_name = 'customers_user_id_key';

SELECT 'Unique constraint on user_id added successfully' as status;

-- Hapus semua cart items yang mungkin menyebabkan masalah
-- Jalankan ini di Supabase SQL Editor

-- Pertama, lihat semua cart items yang ada
SELECT * FROM cart_items;

-- Hapus semua cart items untuk user yang bermasalah
DELETE FROM cart_items WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Jika tidak tahu user_id, hapus semua cart items
-- DELETE FROM cart_items;

-- Cek lagi apakah masih ada
SELECT * FROM cart_items;

SELECT 'Cart items cleaned successfully' as status;

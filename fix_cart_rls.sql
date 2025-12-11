-- Script untuk memeriksa dan memperbaiki RLS policy untuk cart_items
-- Jalankan ini di Supabase SQL Editor

-- 1. Lihat RLS policy yang ada untuk cart_items
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cart_items';

-- 2. Lihat apakah RLS enabled untuk cart_items
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'cart_items';

-- 3. Pastikan RLS enabled
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 4. Hapus policy yang mungkin bentrok
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- 5. Buat policy baru yang lengkap
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Verifikasi policy sudah dibuat
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'cart_items'
ORDER BY policyname;

SELECT 'RLS policies for cart_items fixed successfully' as status;

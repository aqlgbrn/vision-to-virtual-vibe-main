-- Solusi FINAL untuk masalah cart - Disable RLS dan Force Delete
-- Jalankan ini di Supabase SQL Editor

-- 1. HAPUS SEMUA POLICY RLS (disable sementara)
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cart_items;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON cart_items;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON cart_items;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON cart_items;

-- 2. DISABLE RLS SEMENTARA (agar bisa delete tanpa batasan)
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- 3. HAPUS SEMUA DATA CART ITEMS (force clean)
DELETE FROM cart_items;

-- 4. VERIFIKASI KOSONG
SELECT COUNT(*) as total_items FROM cart_items;

-- 5. Enable RLS kembali dengan policy sederhana
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 6. Buat policy yang sangat sederhana
CREATE POLICY "Enable all for authenticated users" ON cart_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 7. Verifikasi policy
SELECT 
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'cart_items';

SELECT '=== FINAL SOLUTION APPLIED ===' as status;
SELECT 'RLS Disabled, Data Cleared, RLS Enabled with Simple Policy' as result;

-- DEBUG AUTH - Cek status user dan auth settings
-- Jalankan di Supabase SQL Editor

-- Cek semua users
SELECT 
  '=== ALL USERS ===' as info,
  id,
  email,
  created_at,
  email_confirmed_at,
  phone_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Cek auth settings
SELECT 
  '=== AUTH SETTINGS ===' as info,
  'Check Supabase Dashboard > Authentication > Settings' as action;

-- Update semua users ke confirmed status
UPDATE auth.users 
SET 
  email_confirmed_at = CASE 
    WHEN email_confirmed_at IS NULL THEN created_at 
    ELSE email_confirmed_at 
  END,
  phone_confirmed_at = CASE 
    WHEN phone_confirmed_at IS NULL THEN created_at 
    ELSE phone_confirmed_at 
  END;

-- Cek hasil update
SELECT 
  '=== UPDATE RESULT ===' as info,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  COUNT(*) FILTER (WHERE phone_confirmed_at IS NOT NULL) as phone_confirmed
FROM auth.users;

SELECT 'Auth debug completed!' as status;

-- DISABLE EMAIL VERIFICATION - Untuk development/testing
-- Jalankan di Supabase SQL Editor

-- Update existing users ke confirmed status
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Update phone confirmation juga
UPDATE auth.users 
SET phone_confirmed_at = NOW() 
WHERE phone_confirmed_at IS NULL;

-- Cek hasil
SELECT 
  'Updated users to confirmed status' as action,
  COUNT(*) as updated_count
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

SELECT 'Email verification disabled for existing users!' as status;

-- Check and fix admin user profile issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if admin exists in auth.users
SELECT 
    'Auth User Check' as check_type,
    id, 
    email, 
    created_at
FROM auth.users 
WHERE email = 'admin@123.com';

-- Step 2: Check if admin profile exists in public.users
SELECT 
    'Public User Check' as check_type,
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    created_at
FROM public.users 
WHERE email = 'admin@123.com';

-- Step 3: If admin profile doesn't exist, create it
-- This will insert or update the admin profile
INSERT INTO public.users (id, email, first_name, last_name, phone, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'Admin' as first_name,
    'User' as last_name,
    '' as phone,
    'admin' as role,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email = 'admin@123.com'
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 4: Verify the fix
SELECT 
    'Verification' as check_type,
    u.id, 
    u.email, 
    u.first_name, 
    u.last_name, 
    u.role,
    u.created_at
FROM public.users u
WHERE u.email = 'admin@123.com';

-- Step 5: Check products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Step 6: Test update on a product (replace with actual product ID)
-- Uncomment and replace the ID to test
-- UPDATE products 
-- SET price = 45, stock = 30 
-- WHERE id = 'YOUR_PRODUCT_ID_HERE'
-- RETURNING *;

-- Fix: Create admin user profile in users table
-- This resolves the "User profile not found" error when deleting products

-- First, get the admin user ID from auth.users
-- Replace 'admin@123.com' with your actual admin email if different

-- Insert admin profile into users table
-- Note: You need to replace 'YOUR_ADMIN_USER_ID' with the actual UUID from auth.users
-- To get it, run: SELECT id FROM auth.users WHERE email = 'admin@123.com';

INSERT INTO public.users (id, email, first_name, last_name, phone, role, created_at, updated_at)
SELECT 
    id,
    email,
    'Admin' as first_name,
    'User' as last_name,
    '' as phone,
    'admin' as role,
    now() as created_at,
    now() as updated_at
FROM auth.users
WHERE email = 'admin@123.com'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    updated_at = now();

-- Verify the admin user was created
SELECT id, email, first_name, last_name, role 
FROM public.users 
WHERE email = 'admin@123.com';

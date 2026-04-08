-- Check if user_id in cart matches the logged-in user
-- Run this in Supabase SQL Editor

-- 1. Show all users
SELECT id, email FROM auth.users LIMIT 5;

-- 2. Show cart items with user info
SELECT 
    c.id as cart_id,
    c.user_id,
    u.email as user_email,
    c.product_id,
    c.quantity,
    c.product_name
FROM cart c
LEFT JOIN auth.users u ON c.user_id = u.id
LIMIT 10;

-- 3. Check if the cart user_id exists in auth.users
SELECT 
    c.user_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = c.user_id) 
        THEN 'User exists in auth.users'
        ELSE 'User DOES NOT exist in auth.users'
    END as user_check
FROM cart c;

-- 4. If you know your email, check your user_id
-- Replace 'your-email@example.com' with your actual email
/*
SELECT id as your_user_id 
FROM auth.users 
WHERE email = 'your-email@example.com';
*/

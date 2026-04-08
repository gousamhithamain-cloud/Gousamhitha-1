-- Fix existing cart items by adding user_id
-- Run this AFTER running add-user-id-to-cart.sql

-- Step 1: Find your user_id (replace with your email)
-- Uncomment and update the email below
/*
SELECT id as your_user_id, email 
FROM auth.users 
WHERE email = 'your-email@example.com';
*/

-- Step 2: Show all users (to find your user_id)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 3: Update existing cart items with your user_id
-- Replace 'YOUR-USER-ID-HERE' with your actual user_id from Step 1 or 2
/*
UPDATE cart 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;
*/

-- Step 4: Verify the update
SELECT 
    c.id,
    c.user_id,
    u.email as user_email,
    c.product_id,
    c.quantity,
    c.created_at
FROM cart c
LEFT JOIN auth.users u ON c.user_id = u.id;

-- Step 5: Make user_id NOT NULL after fixing existing data
-- Uncomment after all cart items have user_id
/*
ALTER TABLE cart ALTER COLUMN user_id SET NOT NULL;
*/

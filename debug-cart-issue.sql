-- Debug cart issue - check column names and data
-- Run this in Supabase SQL Editor

-- 1. Show exact column names in cart table
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'cart'
ORDER BY ordinal_position;

-- 2. Show all cart items with all columns
SELECT * FROM cart LIMIT 5;

-- 3. Check if it's user_id or customer_id
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart' AND column_name = 'user_id') 
        THEN 'user_id exists'
        ELSE 'user_id DOES NOT exist'
    END as user_id_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart' AND column_name = 'customer_id') 
        THEN 'customer_id exists'
        ELSE 'customer_id DOES NOT exist'
    END as customer_id_check;

-- 4. Try to fetch cart items (adjust column name if needed)
-- If user_id exists:
SELECT 
    c.id,
    c.user_id,
    c.product_id,
    c.quantity,
    p.name as product_name,
    p.price
FROM cart c
LEFT JOIN products p ON c.product_id = p.id
LIMIT 5;

-- If customer_id exists instead, uncomment this:
/*
SELECT 
    c.id,
    c.customer_id,
    c.product_id,
    c.quantity,
    p.name as product_name,
    p.price
FROM cart c
LEFT JOIN products p ON c.product_id = p.id
LIMIT 5;
*/

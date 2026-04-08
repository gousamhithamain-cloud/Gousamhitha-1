-- Verify cart is ready to work with backend
-- Run this to confirm everything is set up correctly

-- 1. Check cart table has all required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cart'
ORDER BY ordinal_position;

-- 2. Check your cart items with user info
SELECT 
    c.id,
    c.user_id,
    u.email as user_email,
    c.product_id,
    c.quantity,
    c.created_at
FROM cart c
LEFT JOIN auth.users u ON c.user_id = u.id;

-- 3. Check if products exist for cart items
SELECT 
    c.id as cart_id,
    c.product_id,
    c.quantity,
    p.id as product_exists,
    p.name as product_name,
    p.price,
    p.stock
FROM cart c
LEFT JOIN products p ON c.product_id = p.id;

-- 4. Summary
SELECT 
    COUNT(*) as total_cart_items,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(quantity) as total_quantity
FROM cart;

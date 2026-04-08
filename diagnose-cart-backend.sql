-- Diagnose cart backend issue
-- Run this in Supabase SQL Editor

-- 1. Check cart table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cart'
ORDER BY ordinal_position;

-- 2. Check if products table exists and has required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('id', 'name', 'price', 'image_url', 'stock', 'display_unit', 'unit', 'unit_quantity')
ORDER BY ordinal_position;

-- 3. Check cart items and their product references
SELECT 
    c.id,
    c.user_id,
    c.product_id,
    c.quantity,
    p.id as product_exists,
    p.name as product_name
FROM cart c
LEFT JOIN products p ON c.product_id = p.id
LIMIT 10;

-- 4. Test the exact query the backend is using
SELECT 
    c.id, 
    c.product_id, 
    c.quantity, 
    p.id as "products.id",
    p.name as "products.name",
    p.price as "products.price",
    p.image_url as "products.image_url",
    p.stock as "products.stock",
    p.display_unit as "products.display_unit",
    p.unit as "products.unit",
    p.unit_quantity as "products.unit_quantity"
FROM cart c
LEFT JOIN products p ON c.product_id = p.id
WHERE c.user_id = (SELECT id FROM auth.users LIMIT 1)
LIMIT 5;

-- 5. Check for orphaned cart items (product doesn't exist)
SELECT 
    c.id,
    c.product_id,
    c.quantity,
    CASE 
        WHEN p.id IS NULL THEN 'ORPHANED - Product does not exist'
        ELSE 'OK'
    END as status
FROM cart c
LEFT JOIN products p ON c.product_id = p.id;

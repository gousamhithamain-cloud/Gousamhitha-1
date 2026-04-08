-- Direct test to update a product in Supabase
-- This bypasses all backend logic to test if database update works

-- Step 1: Show current products
SELECT 
    id,
    name,
    category,
    price,
    stock,
    unit,
    unit_quantity,
    display_unit,
    in_stock
FROM products
LIMIT 5;

-- Step 2: Try to update the first product (Whole Wheat Bread based on your screenshot)
-- Replace the WHERE clause with the actual product name or ID
UPDATE products 
SET 
    price = 45,
    stock = 30,
    in_stock = true,
    updated_at = NOW()
WHERE name = 'Whole Wheat Bread'
RETURNING *;

-- Step 3: Verify the update
SELECT 
    id,
    name,
    category,
    price,
    stock,
    unit,
    unit_quantity,
    display_unit,
    in_stock,
    updated_at
FROM products
WHERE name = 'Whole Wheat Bread';

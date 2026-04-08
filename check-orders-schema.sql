-- Check orders table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check if there are any orders
SELECT COUNT(*) as total_orders FROM orders;

-- Check orders with different possible column names
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN 'user_id exists'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN 'customer_id exists'
        ELSE 'neither exists'
    END as column_check;

-- Show sample orders (if any)
SELECT * FROM orders LIMIT 5;

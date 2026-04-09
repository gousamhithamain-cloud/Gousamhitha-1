-- Check actual orders data
SELECT id, user_id, customer_name, total, order_status, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

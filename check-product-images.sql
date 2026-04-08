-- Check product images in database
-- Run this in Supabase SQL Editor

-- Check all products and their image URLs
SELECT 
    id,
    name,
    image_url,
    CASE 
        WHEN image_url IS NULL THEN 'NULL'
        WHEN image_url = '' THEN 'EMPTY STRING'
        WHEN image_url LIKE 'http%' THEN 'VALID URL'
        WHEN image_url LIKE 'images/%' THEN 'LOCAL PATH'
        ELSE 'OTHER: ' || LEFT(image_url, 50)
    END as image_status
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- Check the specific BMW product
SELECT 
    id,
    name,
    image_url,
    LENGTH(image_url) as url_length
FROM products
WHERE name LIKE '%BMW%'
LIMIT 5;

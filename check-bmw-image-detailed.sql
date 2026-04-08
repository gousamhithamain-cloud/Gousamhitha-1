-- Check BMW product image in detail
-- Run this in Supabase SQL Editor

-- Check the BMW product image URL
SELECT 
    id,
    name,
    CASE 
        WHEN image_url IS NULL THEN 'NULL'
        WHEN image_url = '' THEN 'EMPTY STRING'
        WHEN image_url LIKE 'data:image%' THEN 'BASE64 IMAGE (length: ' || LENGTH(image_url) || ')'
        WHEN image_url LIKE 'http%' THEN 'HTTP URL: ' || image_url
        WHEN image_url LIKE 'images/%' THEN 'LOCAL PATH: ' || image_url
        ELSE 'OTHER: ' || LEFT(image_url, 100)
    END as image_status,
    LENGTH(image_url) as url_length,
    LEFT(image_url, 100) as url_preview
FROM products
WHERE name LIKE '%BMW%'
LIMIT 5;

-- If it's a base64 image, let's see if it's valid
SELECT 
    id,
    name,
    CASE 
        WHEN image_url LIKE 'data:image/png;base64,%' THEN 'Valid PNG Base64'
        WHEN image_url LIKE 'data:image/jpeg;base64,%' THEN 'Valid JPEG Base64'
        WHEN image_url LIKE 'data:image/jpg;base64,%' THEN 'Valid JPG Base64'
        WHEN image_url LIKE 'data:image/%' THEN 'Base64 but unknown format'
        ELSE 'Not Base64'
    END as image_format
FROM products
WHERE name LIKE '%BMW%';

-- Update BMW product to use a placeholder image URL instead of base64
-- Uncomment this to fix the image issue
/*
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'
WHERE name LIKE '%BMW%'
RETURNING id, name, image_url;
*/

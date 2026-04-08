-- Add user_id column to cart table
-- Run this in Supabase SQL Editor

-- Step 1: Check if user_id column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart' AND column_name = 'user_id'
    ) THEN
        -- Add user_id column
        ALTER TABLE cart ADD COLUMN user_id UUID;
        
        RAISE NOTICE 'user_id column added to cart table';
    ELSE
        RAISE NOTICE 'user_id column already exists';
    END IF;
END $$;

-- Step 2: Add foreign key constraint to auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cart_user_id_fkey'
    ) THEN
        ALTER TABLE cart 
        ADD CONSTRAINT cart_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Step 4: Show updated structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cart'
ORDER BY ordinal_position;

-- Step 5: Show existing cart data
SELECT * FROM cart LIMIT 5;

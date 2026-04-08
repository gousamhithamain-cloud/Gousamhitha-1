# Cart Fix - Quick Start Guide

## The Problem
Your cart table is missing the `user_id` column. Without it, the backend can't fetch cart items for specific users.

## Quick Fix (3 Steps)

### 1. Add user_id Column
Open Supabase SQL Editor and run:
```sql
-- Add user_id column
ALTER TABLE cart ADD COLUMN user_id UUID;

-- Add foreign key
ALTER TABLE cart 
ADD CONSTRAINT cart_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add index
CREATE INDEX idx_cart_user_id ON cart(user_id);
```

### 2. Update Existing Cart Items
First, find your user_id:
```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Then update your cart items (replace YOUR-USER-ID with your actual ID):
```sql
UPDATE cart 
SET user_id = 'YOUR-USER-ID'
WHERE user_id IS NULL;
```

Verify:
```sql
SELECT c.*, u.email 
FROM cart c 
LEFT JOIN auth.users u ON c.user_id = u.id;
```

### 3. Restart Backend
```bash
restart-backend.bat
```

## Test It
1. Open `test-cart-api.html` in browser
2. Click "Get Cart"
3. Should see your cart items!

## Files Created
- `add-user-id-to-cart.sql` - Full migration script
- `fix-existing-cart-items.sql` - Update existing data
- `check-cart-structure.sql` - Verify table structure
- `test-cart-api.html` - Test page
- `CART-FIX-INSTRUCTIONS.md` - Detailed instructions

## Need Help?
Check backend terminal for errors when fetching cart. Look for:
```
🛒 GET CART - User ID: <your-id>
✅ Cart items fetched: X
```

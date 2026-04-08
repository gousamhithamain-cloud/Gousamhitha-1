# Cart Not Showing Items - Fix Instructions

## Problem
Cart items exist in Supabase database but backend returns 500 error when fetching cart, causing empty cart in UI.

## Root Cause
**CRITICAL:** The cart table is missing the `user_id` column! The backend expects `user_id` but the table only has `id`, `product_id`, `quantity`, and `status`.

## Solution Applied

### Database Fix (REQUIRED)
The cart table needs a `user_id` column to track which user owns each cart item.

**Run these SQL scripts in Supabase SQL Editor in order:**

1. **add-user-id-to-cart.sql** - Adds user_id column to cart table
2. **fix-existing-cart-items.sql** - Updates existing cart items with your user_id

### Backend Fix
Changed the cart fetch logic to use two separate queries:
1. First fetch cart items
2. Then fetch product details separately
3. Combine them in the backend

## Steps to Fix

### Step 1: Add user_id Column to Cart Table
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `add-user-id-to-cart.sql`
4. Verify it says "user_id column added to cart table"

### Step 2: Fix Existing Cart Items
1. In Supabase SQL Editor, run the first part of `fix-existing-cart-items.sql` to find your user_id
2. Copy your user_id
3. Uncomment the UPDATE statement in the script
4. Replace 'YOUR-USER-ID-HERE' with your actual user_id
5. Run the UPDATE statement
6. Verify your cart items now have user_id

### Step 3: Restart Backend Server
### Step 3: Restart Backend Server
Run this command:
```bash
restart-backend.bat
```

Or manually:
```bash
cd backend
taskkill /F /IM node.exe
node server.js
```

### Step 4: Check Backend Logs
### Step 4: Check Backend Logs
When the backend starts, you should see:
```
Server running on port 4000
```

### Step 5: Test Using Test Page
### Step 5: Test Using Test Page
1. Open `test-cart-api.html` in your browser
2. Make sure you're logged in (check user info section)
3. Click "Get Cart" button
4. You should see your cart items with product details

### Step 6: Test in Actual Shop
### Step 6: Test in Actual Shop
1. Go to your shop page
2. Add a product to cart
3. Check the cart count in navigation (should update)
4. Go to cart page - items should now display

### Step 7: Check Backend Terminal
When you fetch cart, you should see logs like:
```
🛒 GET CART - User ID: <your-user-id>
✅ Cart items fetched: 1
✅ Products fetched: 1
✅ Cart with products prepared: 1 items
```

## Diagnostic SQL Scripts

### Check Cart Data
Run `diagnose-cart-backend.sql` in Supabase SQL Editor to:
- Verify cart table structure
- Check if products table has required columns
- Find orphaned cart items (products that don't exist)
- Test the exact query structure

### Check User ID Match
Run `check-user-id-match.sql` to verify:
- Your user exists in auth.users
- Cart items have valid user_id
- User_id in cart matches your logged-in user

## Common Issues

### Issue 1: Backend Still Returns 500
**Check:**
- Backend terminal for exact error message
- Run `diagnose-cart-backend.sql` to check for orphaned products
- Verify products table exists and has all required columns

### Issue 2: Cart Count Still Shows 0
**Check:**
- Browser console (F12) for errors
- Verify token exists: `localStorage.getItem('token')`
- Verify user exists: `localStorage.getItem('user')`
- Check network tab for API call status

### Issue 3: "Not Logged In" Error
**Check:**
- Token is stored as `token` (not `auth_token`)
- User is stored as `user` (not `auth_user`)
- Token hasn't expired (try logging in again)

## Files Modified
- `backend/controllers/cartController.js` - Fixed getCart function
- `js/cart-count-updater.js` - Already checks both token keys
- `js/product-display-optimized-v2.js` - Already checks both token keys

## Next Steps if Still Not Working

1. **Check backend terminal** when loading cart - look for the exact error
2. **Run diagnostic SQL** to verify database structure
3. **Check browser console** for frontend errors
4. **Verify RLS policies** on cart table in Supabase (might be blocking queries)
5. **Check foreign key constraints** between cart and products tables

## Testing Checklist
- [ ] Backend server restarted
- [ ] Backend logs show no errors on startup
- [ ] test-cart-api.html shows cart items
- [ ] Shop page can add items to cart
- [ ] Cart count updates in navigation
- [ ] Cart page displays items correctly
- [ ] Product details (name, price, image) show correctly

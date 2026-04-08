# Testing Guide - Frontend-Backend Integration

## Quick Start

### 1. Clear Everything
```
1. Close all browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Select "Cached images and files"
4. Clear data
```

### 2. Start Backend
```bash
cd Gousamhitha-main/backend
node server.js
```

Expected output:
```
🚀 Server running on http://localhost:4000
```

### 3. Start Frontend
```bash
cd Gousamhitha-main
python -m http.server 5173
```

Or use your preferred method to serve on port 5173

### 4. Open Browser
```
http://localhost:5173
```

## Test Sequence

### Test 1: Login ✅
1. Open http://localhost:5173
2. Click profile icon (top right)
3. Enter credentials:
   - Email: k.sairuthvikreddy880@gmail.com
   - Password: [your password]
4. Click "Sign In"

**Expected:**
- ✅ "Login successful!" message
- ✅ Page reloads
- ✅ Profile icon shows user initial
- ✅ Console shows: "✅ Session restored for: [email]"

**Check localStorage:**
```javascript
// Open console (F12)
console.log(localStorage.getItem('token'));  // Should show token
console.log(localStorage.getItem('user'));   // Should show user JSON
```

### Test 2: Profile Page ✅
1. Click profile icon
2. Should redirect to profile.html

**Expected:**
- ✅ Profile page loads
- ✅ Shows user email
- ✅ Shows user name
- ✅ Shows orders section
- ✅ No errors in console

**Console should show:**
```
📄 PROFILE PAGE HANDLER LOADING...
🔄 Loading profile page...
✅ User found: [email]
✅ Fresh profile data loaded via API client
✅ Profile displayed successfully
📦 Loading orders for user: [userId]
✅ Orders loaded via fetch: N
```

### Test 3: Orders Display ✅
1. On profile page
2. Scroll to orders section

**Expected:**
- ✅ Shows test order (if created)
- ✅ Displays order details:
  - Order ID
  - Status: Pending
  - Total: ₹550
  - Date
  - Items: 2
- ✅ Or shows "No orders yet" if empty

### Test 4: Cart Page ✅
1. Navigate to http://localhost:5173/cart.html

**Expected:**
- ✅ Page loads without errors
- ✅ NO "Supabase not initialized" error
- ✅ Shows cart items or "Your cart is empty"
- ✅ Can update quantities (if items exist)
- ✅ Can remove items (if items exist)

**Console should show:**
```
🛒 Clean Cart System loading...
✅ Clean Cart System loaded (Backend API only)
🛒 DOM ready, initializing cart system
🛒 Fetching cart for user: [userId]
🛒 Cart items loaded: N
```

### Test 5: Logout ✅
1. Click logout button
2. Confirm logout

**Expected:**
- ✅ Redirected to home page
- ✅ localStorage cleared
- ✅ Profile icon shows login prompt
- ✅ Console shows: "✅ Logged out successfully"

**Verify localStorage cleared:**
```javascript
console.log(localStorage.getItem('token'));  // Should be null
console.log(localStorage.getItem('user'));   // Should be null
```

## Troubleshooting

### Problem: 401 Unauthorized errors
**Solution:**
1. Logout completely
2. Clear localStorage manually:
   ```javascript
   localStorage.clear();
   ```
3. Login again
4. Check token is saved

### Problem: "API_BASE already declared"
**Solution:**
1. Hard refresh (Ctrl+F5)
2. Clear cache completely
3. Ensure config.js loads first

### Problem: Profile shows old data
**Solution:**
1. Check console for API errors
2. Verify Authorization header is sent
3. Check backend is running
4. Try logout and login again

### Problem: Orders not appearing
**Solution:**
1. Check console for 401 errors
2. Verify token is valid
3. Check backend logs
4. Run test order creation script:
   ```bash
   cd backend
   node create-test-order.js
   ```

### Problem: Cart not loading
**Solution:**
1. Check console for errors
2. Verify no "Supabase not initialized"
3. Check Authorization header
4. Verify backend is running

## Console Commands

### Check Authentication Status
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('Is Logged In:', !!localStorage.getItem('token'));
```

### Test API Call
```javascript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

fetch('http://localhost:4000/api/users/' + user.id, {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('Profile:', d))
.catch(e => console.error('Error:', e));
```

### Test Orders API
```javascript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

fetch('http://localhost:4000/api/orders/user/' + user.id, {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('Orders:', d))
.catch(e => console.error('Error:', e));
```

### Test Cart API
```javascript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

fetch('http://localhost:4000/api/cart/' + user.id, {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('Cart:', d))
.catch(e => console.error('Error:', e));
```

## Success Criteria

All tests pass when:
- ✅ Login works and stores token
- ✅ Profile page loads from API
- ✅ Orders display correctly
- ✅ Cart works via API only
- ✅ No 401 errors
- ✅ No JavaScript errors
- ✅ No "Supabase not initialized" errors
- ✅ Logout clears session

## Status Indicators

### ✅ Working Correctly
- Green checkmarks in console
- Data loads properly
- No error messages
- API calls return 200 OK

### ❌ Needs Fixing
- Red X marks in console
- 401 Unauthorized errors
- "Supabase not initialized"
- Data not loading
- JavaScript errors

## Quick Fix Commands

### Clear Everything and Start Fresh
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Logout
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
window.location.href = '/';
```

### Check Backend Status
```bash
# In terminal
curl http://localhost:4000/api/products
# Should return JSON with products
```

## Final Checklist

Before reporting issues, verify:
- [ ] Backend is running on port 4000
- [ ] Frontend is served on port 5173
- [ ] Browser cache is cleared
- [ ] Page is hard refreshed (Ctrl+F5)
- [ ] Console shows no errors
- [ ] localStorage has token and user
- [ ] All API calls include Authorization header

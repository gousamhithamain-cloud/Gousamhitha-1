# Admin Panel Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start Backend Server
```bash
cd Gousamhitha-main/backend
node server.js
```

Wait for:
```
🚀 Server running on http://localhost:4000
```

### Step 2: Start Frontend Server
```bash
cd Gousamhitha-main
python -m http.server 5173
```

### Step 3: Open Admin Panel
Open browser and go to:
- **Products**: http://localhost:5173/admin-products-new.html
- **Vendors**: http://localhost:5173/admin-vendors-new.html

## ✅ What Should Happen

### Products Page
1. Page loads
2. Console shows: "✅ Products loaded: X"
3. Table displays all products
4. Can edit/delete products

### Vendors Page
1. Page loads
2. Console shows: "✅ Vendors loaded: X"
3. Table displays all vendors
4. Can add/edit/delete vendors

## ❌ If Something Goes Wrong

### "Not authenticated" Error
```bash
# Solution: Login first
1. Go to http://localhost:5173/index.html
2. Click login
3. Use admin credentials
4. Then go to admin panel
```

### "Error loading products/vendors"
```bash
# Solution: Check backend
1. Is backend running? Check terminal
2. Try: curl http://localhost:4000/api/health
3. Should return: {"success":true,"status":"ok"}
```

### Empty Tables
```bash
# Solution: Check database
1. Open Supabase dashboard
2. Check products table has data
3. Check vendors table has data
4. If empty, add test data
```

### Console Errors
```bash
# Solution: Clear cache
1. Press F12 (open DevTools)
2. Press Ctrl+Shift+Delete
3. Clear all cached data
4. Hard refresh: Ctrl+F5
```

## 🔍 Debugging

### Check Console (F12)
Should see:
```
✅ Admin API Client loaded
✅ Admin Products Handler loaded
📦 Loading products...
📡 API Call: GET http://localhost:4000/api/products
📥 API Response (200): {...}
✅ Products loaded: 10
```

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for API calls
5. Status should be 200 (green)
6. If 401: Not authenticated
7. If 403: Not authorized (not admin)
8. If 500: Backend error

### Check localStorage
```javascript
// In browser console (F12)
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

Should show token and user data. If null, you need to login.

## 📝 Test Checklist

### Products
- [ ] Products display in table
- [ ] Can click "Edit" button
- [ ] Edit form opens with product data
- [ ] Can modify fields
- [ ] Click "Save Changes" works
- [ ] Product updates in table
- [ ] Can delete product
- [ ] No console errors

### Vendors
- [ ] Vendors display in table
- [ ] Can fill "Add New Vendor" form
- [ ] Click "Save Vendor" works
- [ ] New vendor appears in table
- [ ] Can click "Edit" button
- [ ] Form fills with vendor data
- [ ] Can modify and save
- [ ] Can delete vendor
- [ ] No console errors

## 🎯 Success Criteria

✅ Backend server running on port 4000
✅ Frontend server running on port 5173
✅ Logged in as admin
✅ Products page loads and displays data
✅ Vendors page loads and displays data
✅ Can perform CRUD operations
✅ No console errors
✅ No network errors

## 📞 Still Having Issues?

1. Check `ADMIN-PANEL-WORKING.md` for detailed troubleshooting
2. Check `ADMIN-PANEL-API-FIX.md` for technical details
3. Look at console logs for specific error messages
4. Check backend terminal for API errors

## 🔄 To Replace Old Pages

Once everything works:
```bash
# Backup old files
mv admin-products.html admin-products-old.html
mv admin-vendors.html admin-vendors-old.html

# Use new files
mv admin-products-new.html admin-products.html
mv admin-vendors-new.html admin-vendors.html
```

Then access at normal URLs:
- http://localhost:5173/admin-products.html
- http://localhost:5173/admin-vendors.html

## Status: Ready to Test! 🎉

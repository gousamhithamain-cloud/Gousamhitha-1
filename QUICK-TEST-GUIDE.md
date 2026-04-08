# Quick Test Guide - Session Persistence

## Servers Running
- ✅ Backend API: http://localhost:4000
- ✅ Frontend: http://localhost:5173

## Test Steps

### 1. Test Login & Session Persistence
```
1. Open: http://localhost:5173/index.html
2. Click "Sign In" or "Sign Up"
3. Create account or login
4. ✅ Page reloads - you should see logged-in state
5. Press F5 to refresh
6. ✅ You should STILL be logged in (no login modal)
```

### 2. Test Profile Button
```
1. While logged in, click the profile icon (top right)
2. ✅ Should show dropdown with:
   - Your name
   - Your email
   - "View Profile" option
   - "Logout" option
```

### 3. Test Logout
```
1. Click "Logout" from profile dropdown
2. ✅ Should redirect to home page
3. ✅ Should show login button again
4. ✅ localStorage should be cleared
```

### 4. Test API Calls (Browser Console)
```javascript
// Check if logged in
const user = getCurrentUser();
console.log('Current user:', user);

// Make authenticated API call
const response = await fetchWithAuth('http://localhost:4000/api/users/me');
const data = await response.json();
console.log('User data:', data);

// Check localStorage
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', localStorage.getItem('auth_user'));
```

### 5. Test Token Validation
```javascript
// In browser console while logged in
await validateToken(); // Should return true

// Corrupt token
localStorage.setItem('auth_token', 'invalid');
await validateToken(); // Should return false and clear session
```

## Expected Behavior

### On Login Success
- ✅ Token saved to localStorage
- ✅ User data saved to localStorage
- ✅ Page reloads
- ✅ UI shows logged-in state
- ✅ Profile button shows user info

### On Page Refresh
- ✅ Session restored automatically
- ✅ No login modal appears
- ✅ User stays logged in
- ✅ UI shows logged-in state

### On Logout
- ✅ localStorage cleared
- ✅ Redirect to home page
- ✅ UI shows logged-out state
- ✅ Login button visible

## Debugging

### Check localStorage
```javascript
// In browser console
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', JSON.parse(localStorage.getItem('auth_user')));
```

### Check Session Restoration
```javascript
// In browser console
restoreSession(); // Should update UI based on login state
```

### Check Backend Connection
```bash
# Test /users/me endpoint
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### Issue: Session not persisting
**Solution**: Check browser console for errors, verify localStorage has token

### Issue: Token invalid after refresh
**Solution**: Check backend logs, verify /api/users/me endpoint works

### Issue: UI not updating
**Solution**: Hard refresh (Ctrl+Shift+R), check console for errors

### Issue: CORS errors
**Solution**: Verify both servers are running, check CORS config

## Success Criteria

✅ User can login and stay logged in after refresh
✅ Profile button shows user info when logged in
✅ Logout clears session and redirects
✅ API calls include Authorization header
✅ Token validation works correctly
✅ UI updates based on login state

All features are now implemented and ready to test!

# Database Column Names Reference

## Orders Table - Actual Schema

Based on `COMPLETE-SETUP.sql`, the actual database schema uses these column names:

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT,
    pincode TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    delivery_address TEXT,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'Pending',
    total NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Column Name Mapping

### ✅ Correct Names (Use These)
- `email` (not `customer_email`)
- `phone` (not `customer_phone`)
- `total` (not `total_amount`)
- `order_status` (not `status`)
- `notes` (not `order_notes`)
- `address` (primary address field)
- `delivery_address` (secondary address field)

### ❌ Incorrect Names (Don't Use)
- ~~`customer_email`~~ → Use `email`
- ~~`customer_phone`~~ → Use `phone`
- ~~`total_amount`~~ → Use `total`
- ~~`status`~~ → Use `order_status`
- ~~`order_notes`~~ → Use `notes`
- ~~`subtotal`~~ → Not in orders table (only in order_items)
- ~~`delivery_charge`~~ → Not in orders table

## Order Items Table

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Note: Order items use `subtotal` (not `total`)

## Files Updated

### Backend
- ✅ `backend/controllers/orderController.js` - Fixed to use correct column names
- ✅ `backend/middleware/validators.js` - Updated to accept both old and new names for backward compatibility

### Frontend
- ✅ `js/profile-page-handler.js` - Updated to handle both old and new column names
- ⚠️ `frontend-db.js` - Still uses `customer_email` in checkout (needs frontend update)
- ⚠️ `admin-db.js` - Still displays `customer_email` (will work if API returns it)

## Backward Compatibility

The validator now accepts both old and new column names:
- `email` OR `customer_email`
- `phone` OR `customer_phone`
- `total` OR `total_amount`
- `notes` OR `order_notes`
- `address` OR `delivery_address`

The backend controller converts to the correct database column names before inserting.

## Testing

Run these scripts to verify:
```bash
cd backend
node test-orders.js        # Check database schema
node create-test-order.js  # Create test order with correct schema
node test-orders-api.js    # Test API endpoint (requires login)
```

## Next Steps

1. Update frontend checkout form to use correct column names
2. Update admin dashboard to use correct column names
3. Test complete order creation flow
4. Verify all orders display correctly

## Important Notes

- Always use the column names from the actual database schema
- The backend now handles both old and new names for smooth migration
- Frontend display code should check for both names for compatibility
- New code should use the correct column names from this reference

const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, batchResponse } = require('../utils/response');

const VALID_STATUSES = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

// Helper: enrich orders with user details via separate query
async function enrichOrdersWithUsers(orders) {
    if (!orders.length) return orders;

    // Get unique user IDs
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];

    let usersMap = {};
    if (userIds.length) {
        const { data: users } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, phone')
            .in('id', userIds);

        (users || []).forEach(u => { usersMap[u.id] = u; });
    }

    return orders.map(order => {
        const u = usersMap[order.user_id] || {};
        const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ');
        return {
            ...order,
            customer_name: (order.customer_name && order.customer_name !== 'Customer')
                ? order.customer_name
                : (fullName || order.customer_name || 'N/A'),
            email: order.email || u.email || 'N/A',
            phone: order.phone || u.phone || 'N/A',
            user: u.id ? { id: u.id, name: fullName || 'N/A', email: u.email || 'N/A', phone: u.phone || 'N/A' } : null
        };
    });
}

// GET /api/orders  (admin — all orders)
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, sortBy = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .order(sortBy, { ascending: sortBy === 'customer_name' })
        .range(offset, offset + limit - 1);

    if (status && VALID_STATUSES.includes(status)) {
        query = query.eq('order_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('❌ getAllOrders error:', JSON.stringify(error, null, 2));
        throw new AppError('Failed to fetch orders', 500);
    }

    // Enrich orders with user details via separate query
    const enriched = await enrichOrdersWithUsers(data || []);
    return batchResponse(res, 200, enriched, count || 0, 'Orders retrieved successfully');
});

// GET /api/orders/user/:userId
const getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('❌ getUserOrders error:', JSON.stringify(error, null, 2));
        throw new AppError('Failed to fetch user orders', 500);
    }

    console.log('📦 User orders found:', (data || []).length, 'for user:', userId);
    if (data && data.length > 0) {
        console.log('📦 Sample order:', JSON.stringify(data[0], null, 2));
    }

    const enriched = await enrichOrdersWithUsers(data || []);
    return batchResponse(res, 200, enriched, count || 0, 'User orders retrieved successfully');
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Order not found', 404);
    }

    const enriched = await enrichOrdersWithUsers([data]);
    return successResponse(res, 200, enriched[0], 'Order retrieved successfully');
});

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
    const {
        user_id, customer_name, email, phone,
        address, delivery_address, city, pincode, notes,
        subtotal, delivery_charge = 0, total,
        payment_method = 'COD', items
    } = req.body;

    console.log('📦 Creating order for user:', user_id);
    console.log('📦 Items count:', items ? items.length : 0);

    // Verify all products exist and stock is available
    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

        if (!product) {
            throw new AppError(`Product ${item.product_id} not found`, 404);
        }

        if (item.quantity > product.stock) {
            throw new AppError(`Insufficient stock for product ${item.product_name}`, 422);
        }
    }

    const orderTotal = total || ((subtotal || 0) + (delivery_charge || 0));
    const finalAddress = address || delivery_address || '';

    // Build insert object - try both column name variants
    const orderInsert = {
        user_id,
        customer_name,
        email,
        phone,
        address: finalAddress,
        delivery_address: delivery_address || address || finalAddress,
        city,
        pincode,
        notes: notes || null,
        total: orderTotal,
        payment_method,
        order_status: 'Pending',
        payment_status: 'pending'
    };

    console.log('📦 Order insert payload:', JSON.stringify(orderInsert, null, 2));

    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

    if (orderErr) {
        console.error('❌ Order insert error:', JSON.stringify(orderErr, null, 2));
        throw new AppError('Failed to create order: ' + orderErr.message, 500);
    }

    return await finishOrder(res, order, items, user_id);
});

async function finishOrder(res, order, items, user_id) {
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
        console.error('❌ Order items insert error:', JSON.stringify(itemsErr, null, 2));
        await supabase.from('orders').delete().eq('id', order.id);
        throw new AppError('Failed to create order items: ' + itemsErr.message, 500);
    }

    // Clear user's cart
    try {
        await supabase.from('cart').delete().eq('user_id', user_id);
    } catch (err) {
        console.error('Warning: Failed to clear cart:', err.message);
    }

    console.log('✅ Order created successfully:', order.id);
    return createdResponse(res, order, 'Order created successfully');
}

// PUT /api/orders/:id/status  (admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Verify order exists
    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', id)
        .single();

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update order status', 500);
    }

    return successResponse(res, 200, data, 'Order status updated successfully');
});

// PUT /api/orders/:id/payment-status (admin only)
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;

    const { data, error } = await supabase
        .from('orders')
        .update({ payment_status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update payment status', 500);
    }

    return successResponse(res, 200, data, 'Payment status updated successfully');
});

// DELETE /api/orders/:id  (admin only)
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify order exists
    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', id)
        .single();

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Delete order items first
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
        throw new AppError('Failed to delete order items', 500);
    }

    // Delete order
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
        throw new AppError('Failed to delete order', 500);
    }

    return successResponse(res, 200, null, 'Order deleted successfully');
});

module.exports = {
    getAllOrders,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
};

/**
 * Admin Orders Handler
 * Handles all order management functionality using backend API
 */

console.log('🔧 Loading Admin Orders Handler...');

const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

// ══════════════════════════════════════════════════════════════════════════════
// LOAD ORDERS
// ══════════════════════════════════════════════════════════════════════════════

async function loadSmartOrders(showLoader = false) {
    console.log('📦 Loading orders...');
    
    if (showLoader && typeof showLoader === 'function') {
        showLoader();
    }
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        if (!token) {
            console.error('❌ No authentication token');
            window.location.href = 'index.html';
            return;
        }
        
        const response = await fetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load orders');
        }
        
        // Extract orders from response
        const orders = result.data?.items || result.data || result.orders || [];
        
        console.log('✅ Orders loaded:', orders.length);
        
        displayOrders(orders);
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        const container = document.getElementById('orders-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #d32f2f;">
                    <p>Failed to load orders: ${error.message}</p>
                    <button onclick="loadSmartOrders(true)" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    } finally {
        if (typeof hideLoader === 'function') {
            hideLoader();
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPLAY ORDERS
// ══════════════════════════════════════════════════════════════════════════════

function displayOrders(orders) {
    const container = document.getElementById('orders-container');
    
    if (!container) {
        console.error('❌ Orders container not found');
        return;
    }
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <p>No orders yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const name = order.customer_name || order.user?.name || 'N/A';
        const email = order.email || order.customer_email || order.user?.email || 'N/A';
        const phone = order.phone || order.customer_phone || order.user?.phone || 'N/A';
        const total = order.total || order.total_amount || 0;
        const status = order.order_status || order.status || 'Pending';
        const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A';
        const shortId = (order.id || '').substring(0, 8).toUpperCase();

        return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-id">Order #${shortId}</div>
                <div class="order-date">${date}</div>
            </div>
            <div class="order-details">
                <div class="detail-row">
                    <span class="label">Customer:</span>
                    <span class="value">${name}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${phone}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Total:</span>
                    <span class="value">₹${total}</span>
                </div>
            </div>
            <div class="order-status">
                <label>Status:</label>
                <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Packed" ${status === 'Packed' ? 'selected' : ''}>Packed</option>
                    <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="order-actions">
                <button class="btn-view" onclick="viewOrderDetails('${order.id}')">View Details</button>
                ${status === 'Delivered' || status === 'Cancelled' ? 
                    `<button class="btn-delete" onclick="deleteOrder('${order.id}')">Delete</button>` : 
                    `<button class="btn-delete" onclick="deleteOrder('${order.id}')" style="background:#dc3545;color:white;border:none;padding:0.5rem 1rem;border-radius:5px;cursor:pointer;margin-left:0.5rem;">Delete</button>`
                }
            </div>
        </div>`;
    }).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE ORDER STATUS
// ══════════════════════════════════════════════════════════════════════════════

async function updateOrderStatus(orderId, newStatus) {
    console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update order status');
        }
        
        console.log('✅ Order status updated');
        alert('Order status updated successfully!');
        
        // Reload orders
        await loadSmartOrders();
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        alert('Error updating order status: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE ORDER
// ══════════════════════════════════════════════════════════════════════════════

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    console.log(`🗑️ Deleting order ${orderId}`);
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete order');
        }
        
        console.log('✅ Order deleted');
        alert('Order deleted successfully!');
        
        // Reload orders
        await loadSmartOrders();
        
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        alert('Error deleting order: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VIEW ORDER DETAILS
// ══════════════════════════════════════════════════════════════════════════════

async function viewOrderDetails(orderId) {
    console.log(`👁️ Viewing order details: ${orderId}`);
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to load order details');
        }
        
        const order = result.data;
        
        // Display order details in a modal or alert
        alert(`Order Details:\n\nOrder ID: ${order.id}\nCustomer: ${order.customer_name}\nEmail: ${order.customer_email}\nTotal: ₹${order.total_amount || order.total}\nStatus: ${order.order_status}`);
        
    } catch (error) {
        console.error('❌ Error loading order details:', error);
        alert('Error loading order details: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZE
// ══════════════════════════════════════════════════════════════════════════════

// Load orders when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing orders...');
    loadSmartOrders(true);
});

// Export functions to window
window.loadSmartOrders = loadSmartOrders;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.viewOrderDetails = viewOrderDetails;

console.log('✅ Admin Orders Handler loaded');

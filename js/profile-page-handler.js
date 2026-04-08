// Profile Page Handler - Uses Backend API
// No direct Supabase access

console.log('📄 ========================================');
console.log('📄 PROFILE PAGE HANDLER LOADING...');
console.log('📄 ========================================');

// Use existing API_BASE from window or define if not exists
if (!window.API_BASE_URL) {
    window.API_BASE_URL = 'http://localhost:4000/api';
}

console.log('📄 API_BASE:', window.API_BASE_URL);

async function loadProfilePage() {
    console.log('🔄 Loading profile page...');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User exists:', !!userStr);
    
    if (!token || !userStr) {
        console.log('❌ Not logged in - redirecting to home');
        showNotLoggedIn();
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        console.log('✅ User found:', user.email);
        
        // Hide loading, show content
        const loadingEl = document.getElementById('loading');
        const contentEl = document.getElementById('profile-content');
        
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        if (contentEl) {
            contentEl.style.display = 'block';
        }
        
        // Display profile data immediately with cached data
        displayProfile(user);
        
        // Try to fetch fresh user data from backend (don't let this break the page)
        try {
            const response = await fetch(`${window.API_BASE_URL}/users/${user.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const freshUserData = result.data || result.user || user;
                console.log('✅ Fresh profile data loaded:', freshUserData);
                // Update with fresh data
                displayProfile(freshUserData);
            } else {
                console.log('⚠️ Could not fetch fresh data (status:', response.status, '), using cached user data');
            }
        } catch (fetchError) {
            console.log('⚠️ Error fetching fresh data, using cached user data:', fetchError.message);
        }
        
        // Load orders (don't let this break the page)
        try {
            await loadUserOrders(user.id, token);
        } catch (ordersError) {
            console.log('⚠️ Error loading orders:', ordersError.message);
            displayOrders([]);
        }
        
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        // Still show content even if there's an error
        const loadingEl = document.getElementById('loading');
        const contentEl = document.getElementById('profile-content');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';
        
        showError(error.message);
    }
}

function displayProfile(user) {
    console.log('🎨 Displaying profile for:', user.email);
    
    // Update header elements
    const emailEl = document.getElementById('profile-email');
    const nameEl = document.getElementById('profile-name');
    const avatarEl = document.getElementById('profile-avatar');
    
    const fullName = user.full_name || 
                    (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                    user.first_name || 
                    user.email.split('@')[0];
    
    if (emailEl) {
        emailEl.textContent = user.email || 'N/A';
        console.log('✅ Email updated');
    }
    
    if (nameEl) {
        nameEl.textContent = fullName;
        console.log('✅ Name updated:', fullName);
    }
    
    if (avatarEl) {
        const initial = fullName.charAt(0).toUpperCase();
        avatarEl.textContent = initial;
        console.log('✅ Avatar updated:', initial);
    }
    
    // Update profile fields
    const fieldName = document.getElementById('field-name');
    const fieldEmail = document.getElementById('field-email');
    const fieldPhone = document.getElementById('field-phone');
    const fieldAddress = document.getElementById('field-address');
    const fieldJoined = document.getElementById('field-joined');
    
    if (fieldName) fieldName.textContent = fullName;
    if (fieldEmail) fieldEmail.textContent = user.email || 'N/A';
    if (fieldPhone) fieldPhone.textContent = user.phone || 'Not provided';
    if (fieldAddress) fieldAddress.textContent = user.address || 'Not provided';
    if (fieldJoined) {
        const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
        fieldJoined.textContent = joinDate;
    }
    
    console.log('✅ Profile displayed successfully');
}

async function loadUserOrders(userId, token) {
    console.log('📦 Loading orders for user:', userId);
    
    try {
        // Use OrdersAPI if available, otherwise fall back to direct fetch
        const response = await fetch(`${window.API_BASE_URL}/orders/user/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.log('⚠️ Failed to load orders:', response.status);
            // Don't throw error, just show empty orders
            displayOrders([]);
            return;
        }
        
        const result = await response.json();
        const orders = result.data?.orders || result.orders || result.data || [];
        console.log('✅ Orders loaded:', orders.length);
        displayOrders(orders);
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        // Don't throw error, just show empty orders
        displayOrders([]);
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    
    // Update orders count
    const fieldOrders = document.getElementById('field-orders');
    if (fieldOrders) {
        fieldOrders.textContent = orders.length;
    }
    
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No orders yet</p>
                <a href="shop.html" style="color: #4a7c59;">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>Order #${order.id.substring(0, 8)}</strong>
                <span style="color: #4a7c59;">${order.order_status || order.status || 'Pending'}</span>
            </div>
            <div style="color: #666; font-size: 0.9rem;">
                <p>Total: ₹${order.total || order.total_amount || 0}</p>
                <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                ${order.order_items && order.order_items.length > 0 ? `<p>Items: ${order.order_items.length}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function showNotLoggedIn() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>Please Login</h3>
                <p>You need to be logged in to view your profile.</p>
                <button onclick="window.location.href='index.html'" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 1rem;">
                    Go to Home
                </button>
            </div>
        `;
    }
}

function showError(message) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 1rem;">
                    Try Again
                </button>
                <br><br>
                <a href="index.html" style="color: #4a7c59;">← Go back to Home</a>
            </div>
        `;
    }
}

// Logout function - use the one from auth-handler.js
// window.logoutUser is already defined in auth-handler.js

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfilePage);
} else {
    loadProfilePage();
}

console.log('✅ Profile page handler loaded');

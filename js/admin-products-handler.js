/**
 * Admin Products Handler
 * Uses backend API instead of direct Supabase
 */

console.log('📦 Loading Admin Products Handler...');

let editingProductId = null;

// ══════════════════════════════════════════════════════════════════════════════
// LOAD PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

async function loadProducts() {
    console.log('📦 Loading products...');
    
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) {
        console.error('❌ Products table body not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';
    
    try {
        const products = await AdminProductsAPI.getAll({ limit: 100 });
        
        console.log('✅ Products loaded:', products.length);
        
        // Debug: Log first product to see field names
        if (products && products.length > 0) {
            console.log('🔍 First product structure:', products[0]);
            console.log('🔍 Available fields:', Object.keys(products[0]));
        }
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No products found. <a href="admin-add-product.html">Add your first product</a></td></tr>';
            return;
        }
        
        displayProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products: ${error.message}<br><small>Check console for details</small></td></tr>`;
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-table-body');
    
    // Safety check: ensure products is an array
    if (!Array.isArray(products)) {
        console.error('❌ Products is not an array:', products);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error: Invalid data format</td></tr>';
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No products available</td></tr>';
        return;
    }
    
    // Debug first product
    console.log('🔍 FIRST PRODUCT IN DISPLAY:', products[0]);
    console.log('🔍 PRODUCT FIELDS:', Object.keys(products[0]));
    if (products[0]) {
        console.log('🖼️ IMAGE FIELD CHECK:', {
            image_url: products[0].image_url,
            image: products[0].image,
            imageUrl: products[0].imageUrl,
            type: typeof products[0].image_url,
            length: products[0].image_url ? products[0].image_url.length : 0
        });
    }
    
    tbody.innerHTML = products.map(product => {
        // Get image URL with multiple fallbacks
        const imageUrl = product.image_url || product.image || product.imageUrl || 'images/placeholder.png';
        
        // Log each product's image
        console.log(`🖼️ Product "${product.name}" using image:`, imageUrl.substring(0, 100));
        
        return `
        <tr>
            <td>
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     onerror="this.onerror=null; this.src='images/placeholder.png'; console.error('❌ Failed to load image for ${product.name}');"
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; background: #f5f5f5;">
            </td>
            <td>${product.name || 'N/A'}</td>
            <td>${product.category || 'N/A'}</td>
            <td>₹${product.price || 0}</td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="status-badge ${product.in_stock ? 'status-active' : 'status-inactive'}">
                    ${product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT PRODUCT
// ══════════════════════════════════════════════════════════════════════════════

async function editProduct(id) {
    console.log('✏️ Editing product:', id);
    
    try {
        const product = await AdminProductsAPI.getById(id);
        
        console.log('✅ Product loaded for editing:', product);
        
        // Set form values
        editingProductId = id;
        document.getElementById('edit-product-id').value = id;
        document.getElementById('edit-name').value = product.name || '';
        document.getElementById('edit-category').value = product.category || '';
        document.getElementById('edit-price').value = product.price || '';
        document.getElementById('edit-stock').value = product.stock || '';
        document.getElementById('edit-unit').value = product.unit || 'kg';
        document.getElementById('edit-unit-quantity').value = product.unit_quantity || '';
        document.getElementById('edit-display-unit').value = product.display_unit || '';
        
        // Show edit panel
        document.getElementById('edit-overlay').classList.add('active');
        document.getElementById('edit-panel').classList.add('active');
        
    } catch (error) {
        console.error('❌ Error loading product:', error);
        alert('Error loading product: ' + error.message);
    }
}

function closeEditPanel() {
    document.getElementById('edit-overlay').classList.remove('active');
    document.getElementById('edit-panel').classList.remove('active');
    editingProductId = null;
    window.editImageBase64 = '';
    document.getElementById('edit-image-preview').innerHTML = '';
}

async function saveProductEdit(event) {
    event.preventDefault();
    
    console.log('💾 Saving product...');
    
    // Get raw values from form
    const nameValue = document.getElementById('edit-name').value.trim();
    const categoryValue = document.getElementById('edit-category').value.trim();
    const priceValue = document.getElementById('edit-price').value.trim();
    const stockValue = document.getElementById('edit-stock').value.trim();
    const unitValue = document.getElementById('edit-unit').value.trim();
    const unitQuantityValue = document.getElementById('edit-unit-quantity').value.trim();
    const displayUnitValue = document.getElementById('edit-display-unit').value.trim();
    
    // Construct clean payload with proper types
    const productData = {};
    
    // Required string fields
    if (nameValue) productData.name = nameValue;
    if (categoryValue) productData.category = categoryValue;
    
    // Required numeric fields - convert to numbers
    if (priceValue) {
        const price = Number(priceValue);
        if (!isNaN(price) && price > 0) {
            productData.price = price;
        }
    }
    
    if (stockValue) {
        const stock = Number(stockValue);
        if (!isNaN(stock) && stock >= 0) {
            productData.stock = stock;
        }
    }
    
    // Optional string field
    if (unitValue) productData.unit = unitValue;
    
    // Optional numeric field - only include if has value
    if (unitQuantityValue) {
        const unitQuantity = Number(unitQuantityValue);
        if (!isNaN(unitQuantity) && unitQuantity > 0) {
            productData.unit_quantity = unitQuantity;
        }
    }
    
    // Optional string field
    if (displayUnitValue) productData.display_unit = displayUnitValue;
    
    // Add image if uploaded
    if (window.editImageBase64) {
        productData.image_url = window.editImageBase64;
    }
    
    // DO NOT send in_stock - it's a generated column in the database
    
    console.log('📤 Clean product data:', productData);
    console.log('📤 Editing product ID:', editingProductId);
    
    try {
        await AdminProductsAPI.update(editingProductId, productData);
        
        console.log('✅ Product updated successfully');
        alert('Product updated successfully!');
        
        closeEditPanel();
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error updating product:', error);
        alert('Error updating product: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE PRODUCT
// ══════════════════════════════════════════════════════════════════════════════

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    console.log('🗑️ Deleting product:', id);
    
    try {
        await AdminProductsAPI.delete(id);
        
        console.log('✅ Product deleted successfully');
        alert('Product deleted successfully!');
        
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// TOGGLE STOCK STATUS
// ══════════════════════════════════════════════════════════════════════════════

async function toggleStock(id, currentStatus) {
    const newStatus = !currentStatus;
    
    console.log(`🔄 Toggling stock for ${id}: ${currentStatus} → ${newStatus}`);
    
    try {
        await AdminProductsAPI.update(id, { in_stock: newStatus });
        
        console.log('✅ Stock status updated');
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error updating stock status:', error);
        alert('Error updating stock status: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

window.loadProducts = loadProducts;
window.editProduct = editProduct;
window.closeEditPanel = closeEditPanel;
window.saveProductEdit = saveProductEdit;
window.deleteProduct = deleteProduct;
window.toggleStock = toggleStock;
window.adminLogout = adminLogout;

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

function initializeProductsPage() {
    console.log('🚀 Initializing products page...');
    
    // Load products (auth check removed for initial load)
    loadProducts();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductsPage);
} else {
    initializeProductsPage();
}

console.log('✅ Admin Products Handler loaded');

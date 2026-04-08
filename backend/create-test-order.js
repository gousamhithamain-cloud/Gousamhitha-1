require('dotenv').config();
const supabase = require('./config/supabase');

async function createTestOrder() {
    console.log('🔍 Creating test order...\n');
    
    // Get the user
    const userEmail = 'k.sairuthvikreddy880@gmail.com';
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
    
    if (userError || !user) {
        console.error('❌ User not found:', userError);
        return;
    }
    
    console.log('✅ Found user:', user.email, '(ID:', user.id, ')');
    
    // Create a test order - using actual database column names
    const testOrder = {
        user_id: user.id,
        customer_name: user.first_name + ' ' + (user.last_name || ''),
        email: user.email,
        phone: user.phone || '9876543210',
        address: '123 Test Street',
        delivery_address: '123 Test Street',
        city: 'Test City',
        pincode: '500001',
        notes: 'Test order created by script',
        total: 550,
        payment_method: 'COD',
        order_status: 'Pending',
        payment_status: 'Pending'
    };
    
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();
    
    if (orderError) {
        console.error('❌ Error creating order:', orderError);
        return;
    }
    
    console.log('\n✅ Test order created successfully!');
    console.log('Order ID:', order.id);
    console.log('User ID:', order.user_id);
    console.log('Total:', order.total);
    console.log('Status:', order.order_status);
    
    // Create test order items - using actual database column names
    const testItems = [
        {
            order_id: order.id,
            product_id: '00000000-0000-0000-0000-000000000001',
            product_name: 'Test Product 1',
            quantity: 2,
            price: 200,
            subtotal: 400
        },
        {
            order_id: order.id,
            product_id: '00000000-0000-0000-0000-000000000002',
            product_name: 'Test Product 2',
            quantity: 1,
            price: 100,
            subtotal: 100
        }
    ];
    
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(testItems);
    
    if (itemsError) {
        console.error('❌ Error creating order items:', itemsError);
    } else {
        console.log('✅ Order items created successfully!');
    }
    
    // Verify the order can be fetched
    console.log('\n🔍 Verifying order can be fetched...');
    const { data: fetchedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .single();
    
    if (fetchError) {
        console.error('❌ Error fetching order:', fetchError);
    } else {
        console.log('✅ Order fetched successfully!');
        console.log('Order has', fetchedOrder.order_items?.length || 0, 'items');
    }
}

createTestOrder().then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});

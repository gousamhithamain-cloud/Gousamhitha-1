require('dotenv').config();
const supabase = require('./config/supabase');

async function testOrders() {
    console.log('🔍 Testing orders table...\n');
    
    // Check all orders - select all columns
    const { data: allOrders, error: allError } = await supabase
        .from('orders')
        .select('*')
        .limit(10);
    
    if (allError) {
        console.error('❌ Error fetching orders:', allError);
        return;
    }
    
    console.log(`📦 Total orders found: ${allOrders?.length || 0}\n`);
    
    if (allOrders && allOrders.length > 0) {
        console.log('Sample orders:');
        allOrders.forEach((order, i) => {
            console.log(`\n${i + 1}. Order:`, JSON.stringify(order, null, 2));
        });
    } else {
        console.log('⚠️ No orders found in database');
    }
    
    // Check users table
    console.log('\n\n👥 Checking users table...\n');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .limit(5);
    
    if (usersError) {
        console.error('❌ Error fetching users:', usersError);
    } else {
        console.log(`Total users: ${users?.length || 0}`);
        if (users && users.length > 0) {
            users.forEach((user, i) => {
                console.log(`${i + 1}. ${user.email} (ID: ${user.id})`);
            });
        }
    }
}

testOrders().then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});

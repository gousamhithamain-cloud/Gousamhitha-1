require('dotenv').config();

async function testOrdersAPI() {
    console.log('🔍 Testing Orders API...\n');
    
    const fetch = require('node-fetch');
    
    // First, login to get a real token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('http://localhost:4000/api/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'k.sairuthvikreddy880@gmail.com',
            password: 'Test@123'  // You'll need to use the actual password
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
        console.error('❌ Login failed:', loginData);
        console.log('\n⚠️ Please update the password in the script to match the actual user password');
        return;
    }
    
    const token = loginData.data.session.access_token;
    const userId = loginData.data.user.id;
    
    console.log('✅ Logged in successfully');
    console.log('User ID:', userId);
    console.log('User email:', loginData.data.user.email);
    
    // Test the orders API endpoint
    console.log('\n📡 Fetching orders...');
    const response = await fetch(`http://localhost:4000/api/orders/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log('API Response Status:', response.status);
    
    const data = await response.json();
    console.log('\n📦 API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data && data.data.orders) {
        console.log(`\n✅ Found ${data.data.orders.length} orders`);
        if (data.data.orders.length > 0) {
            console.log('\nFirst order details:');
            console.log('- ID:', data.data.orders[0].id);
            console.log('- Status:', data.data.orders[0].order_status);
            console.log('- Total:', data.data.orders[0].total);
            console.log('- Items:', data.data.orders[0].order_items?.length || 0);
        }
    } else if (Array.isArray(data.data)) {
        console.log(`\n✅ Found ${data.data.length} orders`);
    }
}

testOrdersAPI().then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
}).catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});

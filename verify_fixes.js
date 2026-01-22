
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
// You might need to update this token with a valid one from your browser/local storage
const TOKEN = 'YOUR_VALID_JWT_TOKEN_HERE';

async function testIdempotency() {
    console.log('\n🧪 Testing Idempotency...');
    try {
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                items: [{ productId: 'some-uuid', quantity: 1 }],
                // Missing idempotencyKey on purpose
            })
        });

        if (res.status === 400) {
            const data = await res.json();
            if (data.message && data.message.includes('idempotency key')) {
                console.log('✅ PASS: Request without idempotency key rejected (400)');
            } else {
                console.log('⚠️  WARN: Rejected but message differs:', data.message);
            }
        } else {
            console.log(`❌ FAIL: Expected 400, got ${res.status}`);
        }
    } catch (err) {
        console.error('❌ FAIL: Network error', err.message);
    }
}

async function testNegativePrice() {
    console.log('\n🧪 Testing Negative Price Validation...');
    try {
        const res = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                name: 'Test Product',
                price: -100, // Negative price
                stock: 10
            })
        });

        if (res.status === 400) {
            const data = await res.json();
            if (data.message && data.message.includes('negative')) {
                console.log('✅ PASS: Negative price rejected (400)');
            } else {
                console.log('⚠️  WARN: Rejected but message differs:', data.message);
            }
        } else {
            console.log(`❌ FAIL: Expected 400, got ${res.status}`);
        }
    } catch (err) {
        console.error('❌ FAIL: Network error', err.message);
    }
}

async function run() {
    console.log('🚀 Starting Verification of Critical Fixes');
    console.log('-----------------------------------------');
    await testIdempotency();
    await testNegativePrice();
    console.log('\n-----------------------------------------');
    console.log('NOTE: If tests fail, ensure Backend is RESTARTED and TOKEN is valid.');
}

run();

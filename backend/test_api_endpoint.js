const axios = require('axios');

async function testAiFeatures() {
    const baseUrl = 'http://localhost:5003/api';
    let token = '';

    console.log("🚀 Starting Full AI Integration Test...");

    // 1. Login to get Token
    try {
        console.log("\n🔐 Attempting Login...");
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@masterdiary.com',
            password: 'Admin123!'
        });
        token = loginRes.data.accessToken;
        console.log("✅ Login Successful. Token acquired.");
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("⚠️ Login failed. Attempting to seed database...");
            try {
                await axios.get('http://localhost:5003/api/seed-secret');
                console.log("🌱 Database seeded. Retrying login...");
                const retryLogin = await axios.post(`${baseUrl}/auth/login`, {
                    email: 'admin@masterdiary.com',
                    password: 'Admin123!'
                });
                token = retryLogin.data.accessToken;
                console.log("✅ Login Successful after seed.");
            } catch (seedError) {
                console.error("❌ Critical: Could not login or seed database.", seedError.message);
                return;
            }
        } else {
            console.error("❌ Login Error:", error.message);
            return;
        }
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test AI Chat (Pinnacle Copilot)
    try {
        console.log("\n🤖 Testing AI Chat (/api/ai/chat)...");
        const chatRes = await axios.post(`${baseUrl}/ai/chat`, {
            message: "Analyze system status.",
            context: { screen: "Dashboard" }
        }, { headers });
        console.log("✅ AI Chat Response:", JSON.stringify(chatRes.data, null, 2).substring(0, 200) + "...");
    } catch (error) {
        console.error("❌ AI Chat Failed:", error.response ? error.response.data : error.message);
    }

    // 3. Test AI Quote Generation
    try {
        console.log("\n💰 Testing AI Quote (/api/ai/quote)...");
        const quoteRes = await axios.post(`${baseUrl}/ai/quote`, {
            prompt: "Build a quote for painting a 3-bedroom house."
        }, { headers });
        console.log("✅ AI Quote Response:", JSON.stringify(quoteRes.data, null, 2).substring(0, 200) + "...");
    } catch (error) {
        console.error("❌ AI Quote Failed:", error.response ? error.response.data : error.message);
    }

    // 4. Test Diary Summary
    try {
        console.log("\n📝 Testing Diary Summary (/api/ai/summary)...");
        // Create a dummy project/diary first if needed, but endpoint might handle empty
        const summaryRes = await axios.post(`${baseUrl}/ai/summary`, {
            projectId: 'dummy-id'
        }, { headers });
        console.log("✅ Diary Summary Response:", JSON.stringify(summaryRes.data, null, 2).substring(0, 200) + "...");
    } catch (error) {
        console.error("❌ Diary Summary Failed:", error.response ? error.response.data : error.message);
    }
}

testAiFeatures();
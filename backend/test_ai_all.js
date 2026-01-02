const axios = require('axios');

async function testAllAiFeatures() {
    const baseUrl = 'http://localhost:5003/api';
    let token = '';

    console.log("🚀 Starting Comprehensive AI Integration Test...");

    // 1. Login
    try {
        console.log("\n🔐 Attempting Login...");
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@masterdiary.com',
            password: 'Admin123!'
        });
        token = loginRes.data.accessToken;
        console.log("✅ Login Successful.");
    } catch (error) {
        console.error("❌ Login Failed:", error.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Chat
    try {
        console.log("\n🤖 Testing AI Chat...");
        const chatRes = await axios.post(`${baseUrl}/ai/chat`, {
            message: "Status check.",
            context: { screen: "Dashboard" }
        }, { headers });
        console.log("✅ AI Chat Response:", JSON.stringify(chatRes.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ AI Chat Failed:", error.response ? error.response.data : error.message);
    }

    // 3. Test Quote
    try {
        console.log("\n💰 Testing AI Quote...");
        const quoteRes = await axios.post(`${baseUrl}/ai/quote`, {
            prompt: "Paint a room."
        }, { headers });
        console.log("✅ AI Quote Response:", JSON.stringify(quoteRes.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ AI Quote Failed:", error.response ? error.response.data : error.message);
    }

    // 4. Test Summary
    try {
        console.log("\n📝 Testing Diary Summary...");
        const summaryRes = await axios.post(`${baseUrl}/ai/summary`, {
            projectId: 'dummy-id'
        }, { headers });
        console.log("✅ Diary Summary Response:", JSON.stringify(summaryRes.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ Diary Summary Failed:", error.response ? error.response.data : error.message);
    }

    // 5. Test Workflow
    try {
        console.log("\nmw Testing Workflow Generation...");
        const wfRes = await axios.post(`${baseUrl}/ai/workflow`, {
            prompt: "Build a house."
        }, { headers });
        console.log("✅ Workflow Response:", JSON.stringify(wfRes.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ Workflow Failed:", error.response ? error.response.data : error.message);
    }
}

testAllAiFeatures();

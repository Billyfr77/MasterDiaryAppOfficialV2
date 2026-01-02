const axios = require('axios');

async function verifyNewEndpoints() {
    const baseUrl = 'http://localhost:5003/api';
    let token = '';

    console.log("🚀 Verifying NEW AI Endpoints...");

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

    // 2. Test /api/ai/safety-analysis
    try {
        console.log("\n🦺 Testing Safety Analysis Endpoint...");
        const res = await axios.post(`${baseUrl}/ai/safety-analysis`, {
            taskDescription: "Working at heights on a scaffold"
        }, { headers });
        console.log("✅ Safety Response:", JSON.stringify(res.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ Safety Analysis Failed:", error.response ? error.response.data : error.message);
    }

    // 3. Test /api/ai/analyze-document
    try {
        console.log("\n📄 Testing Document Analysis Endpoint...");
        const res = await axios.post(`${baseUrl}/ai/analyze-document`, {
            textContent: "Contract due by Friday. Risk of $500 fine."
        }, { headers });
        console.log("✅ Document Response:", JSON.stringify(res.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ Document Analysis Failed:", error.response ? error.response.data : error.message);
    }
    
    // 4. Test /api/ai/generate-scope
    try {
        console.log("\n📋 Testing Scope Generation Endpoint...");
        const res = await axios.post(`${baseUrl}/ai/generate-scope`, {
            description: "Build a fence 50m long."
        }, { headers });
        console.log("✅ Scope Response:", JSON.stringify(res.data).substring(0, 100) + "...");
    } catch (error) {
        console.error("❌ Scope Generation Failed:", error.response ? error.response.data : error.message);
    }
}

verifyNewEndpoints();
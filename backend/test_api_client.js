const axios = require('axios');

async function testApi() {
  try {
    // Attempt to hit the endpoint directly (bypassing auth if possible, or expect 401/500)
    // Note: This requires the server to be running.
    // Since I cannot start the server myself in this environment persistently, 
    // this script assumes the user's `npm run dev` is active.
    
    // We will just print instructions for the user.
    console.log("Please define a valid token to test:");
    const token = "YOUR_JWT_TOKEN_HERE"; 
    
    const res = await axios.get('http://localhost:5003/api/safety', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (error) {
    console.error("API Error Status:", error.response?.status);
    console.error("API Error Data:", error.response?.data);
  }
}

// console.log("Run this script with a valid token to debug.");

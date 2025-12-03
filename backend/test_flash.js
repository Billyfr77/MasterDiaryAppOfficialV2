const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testFlash() {
  try {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }
    console.log("API Key present.");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Getting model: gemini-1.5-flash");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Sending prompt...");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response: " + text);

  } catch (error) {
    console.error("Error testing Gemini Flash:", error);
  }
}

testFlash();
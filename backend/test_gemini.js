const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testGemini() {
  try {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }
    console.log("API Key present (length: " + process.env.GEMINI_API_KEY.length + ")");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try 'gemini-1.5-flash' first, if that fails, maybe try 'gemini-pro'
    console.log("Getting model: gemini-pro-latest");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    console.log("Sending prompt...");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response: " + text);

  } catch (error) {
    console.error("Error testing Gemini:", error);
  }
}

testGemini();

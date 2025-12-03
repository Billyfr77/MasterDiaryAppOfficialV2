const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  try {
    console.log("Testing API Key: " + API_KEY);
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log("Listing available models...");
    // For GoogleGenerativeAI SDK, there isn't a direct listModels on the instance usually, 
    // but we can try to infer or just test standard ones. 
    // However, usually we need to use the REST API to list models if the SDK doesn't expose it easily.
    // Let's just try 'gemini-pro' which is the standard.
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("gemini-pro works: " + result.response.text());

  } catch (error) {
    console.error("Error testing Gemini:", error.message);
    if (error.message.includes("API key not valid")) {
        console.log("CRITICAL: The provided API key is definitely invalid.");
    }
  }
}

testGemini();

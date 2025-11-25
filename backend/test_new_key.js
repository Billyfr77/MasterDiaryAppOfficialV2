const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyCq2SLK8xe0-o9cAquvqucMEiFUDRamBJI";

async function testGemini() {
  try {
    console.log("Testing API Key: " + API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("Using model: gemini-pro-latest");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response: " + text);

  } catch (error) {
    console.error("Error testing Gemini:", error.message);
    if (error.message.includes("API key not valid")) {
        console.log("CRITICAL: The provided API key is definitely invalid.");
    }
  }
}

testGemini();

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ override: true });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`Using Key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'UNDEFINED'}`);

  if (!apiKey) {
    console.error("No API Key found!");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Hello, can you hear me? Respond with 'Yes, I am working'.";

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response:", text);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
       console.error("Details:", JSON.stringify(error.response, null, 2));
    }
  }
}

testGemini();

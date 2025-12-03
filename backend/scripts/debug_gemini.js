const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

const API_KEY = process.env.GEMINI_API_KEY;

async function debugGemini() {
  console.log("--- Gemini Debug ---");
  console.log("API Key Length:", API_KEY ? API_KEY.length : "Missing");
  
  if (!API_KEY) return;

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Test gemini-1.5-flash
  try {
    console.log("Attempting 'gemini-1.5-flash'...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test.");
    console.log("Success 'gemini-1.5-flash':", result.response.text());
  } catch (e) {
    console.log("Failed 'gemini-1.5-flash':", e.message);
  }

    // Test gemini-pro
    console.log("Attempting 'gemini-pro-latest'...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
    const result = await model.generateContent("Hello");
    console.log("Success 'gemini-pro-latest':", result.response.text());

  } catch (e) {
    console.log("Failed 'gemini-pro-latest':", e.message);
}

debugGemini();

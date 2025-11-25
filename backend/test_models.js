const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyCq2SLK8xe0-o9cAquvqucMEiFUDRamBJI";

async function listModels() {
  try {
    console.log("Listing models...");
    // We can't easily list models with the high-level SDK in this version without an instantiated model generally, 
    // but let's try a direct fetch or just try 'gemini-1.0-pro' which is the specific version string sometimes.
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Trying a fallback to text-bison-001 or similar if gemini fails, but let's stick to gemini variations.
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.0-pro: " + result.response.text());

  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();

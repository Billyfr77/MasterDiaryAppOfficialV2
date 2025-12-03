const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ override: true }); // Ensure .env is loaded

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { models } = await genAI.listModels();
    console.log("Available Gemini Models:");
    for (const model of models) {
      console.log(`- ${model.name}:`);
      console.log(`  DisplayName: ${model.displayName}`);
      console.log(`  Supported Generative Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log(`  Description: ${model.description}`);
      console.log('---');
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
    if (error.response?.status === 400 && error.response?.data?.error?.message.includes("API key expired")) {
        console.error("The API key might still be expired or invalid. Please check your key on aistudio.google.com/app/apikey.");
    } else if (error.response) {
        console.error("Full error response:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

listGeminiModels();

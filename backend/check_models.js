const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function listAllAvailableModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Loaded Key:", key ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}` : "UNDEFINED");
  
  if (!key || key === "UNDEFINED") {
    console.error("API Key not loaded. Please ensure GEMINI_API_KEY is set in your .env file.");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);
  
  try {
    console.log("Attempting to list ALL available models via genAI.listModels()...");
    const { models } = await genAI.listModels();

    if (models && models.length > 0) {
      console.log("Successfully retrieved available models:");
      let foundGenerativeModel = false;
      for (const model of models) {
        console.log(`- ${model.name} (Supports: ${model.supportedGenerationMethods.join(', ')})`);
        if (model.supportedGenerationMethods.includes("generateContent")) { 
            console.log(`  ^-- This model supports generateContent. Consider using it!`);
            foundGenerativeModel = true;
        }
      }
      if (!foundGenerativeModel) {
          console.log("No models supporting 'generateContent' found. Please check your API key and project settings.");
      }
    } else {
      console.log("No models found for this API key/project or listModels() returned an empty list.");
    }

  } catch (error) {
    console.error('Error listing models:', error.message);
    // Log full error details for deeper inspection
    if (error.status) console.error('Status:', error.status);
    if (error.statusText) console.error('Status Text:', error.statusText);
    if (error.errorDetails) console.error('Error Details:', error.errorDetails);
    console.error("It's possible there's a network issue or further API restriction.");
  }
}

listAllAvailableModels();

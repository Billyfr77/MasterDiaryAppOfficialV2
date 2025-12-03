const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels on genAI in the Node SDK usually, it's often on a specific client or via REST.
    // But let's check if the SDK has a helper or if we just try 'gemini-pro'.
    
    // Actually, let's just try 'gemini-pro' and 'gemini-1.5-pro-latest' in this script to see what hits.
    const modelsToTest = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro', 'gemini-1.5-flash-latest'];
    
    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log(`SUCCESS: ${modelName}`);
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
        }
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();

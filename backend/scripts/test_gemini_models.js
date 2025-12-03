const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ override: true });

async function testModel(modelName) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  console.log(`Testing model: ${modelName}...`);
  try {
    const result = await model.generateContent("Test.");
    const response = await result.response;
    console.log(`✅ SUCCESS with ${modelName}!`);
    return true;
  } catch (error) {
    if (error.message.includes("404") || error.message.includes("not found")) {
        console.log(`❌ ${modelName} not found.`);
    } else {
        console.log(`❌ ${modelName} error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
    const models = [
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest"
    ];

    for (const m of models) {
        if (await testModel(m)) {
            console.log(`
🎉 WE HAVE A WINNER: ${m}`);
            console.log("Please update your aiController.js to use this model name.");
            break;
        }
    }
}

runTests();

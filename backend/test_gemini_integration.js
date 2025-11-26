const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testGeminiIntegration() {
  try {
    console.log('Checking for Gemini API key...');
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing in environment variables.');
    }
    console.log('API Key found.');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Initializing Gemini model (gemini-pro)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = 'Hello, can you confirm you are working correctly? Please reply with "Gemini is online."';
    console.log(`Sending prompt: "${prompt}"`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Response received from Gemini:');
    console.log('--------------------------------------------------');
    console.log(text);
    console.log('--------------------------------------------------');
    console.log('Gemini integration test completed successfully.');

  } catch (error) {
    console.error('Gemini integration test failed:');
    console.error(error);
  }
}

testGeminiIntegration();

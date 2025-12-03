const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testChat() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Getting model: gemini-pro-latest");
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    console.log("Starting chat...");
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "System Prompt: Act as an assistant." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood." }],
        },
      ],
    });

    console.log("Sending message...");
    const result = await chat.sendMessage("Hello, this is a test.");
    const response = await result.response;
    console.log("Response:", response.text());

  } catch (error) {
    console.error("Error testing Chat:", error);
  }
}

testChat();
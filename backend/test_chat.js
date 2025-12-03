const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testChat() {
  try {
    console.log("--- Testing Gemini Chat ---");
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    // Simulate the context and history construction from aiController
    const systemPrompt = "You are a helpful assistant.";
    
    // Scenario 1: First message (Context only has initial greeting)
    console.log("\nTest 1: First Message");
    let context1 = [{ role: 'assistant', content: 'Hello! How can I help?' }];
    let message1 = "Hi there";
    await runControllerLogic(model, systemPrompt, context1, message1);

    // Scenario 2: Follow up (Context has AI, User, AI)
    console.log("\nTest 2: Follow Up");
    let context2 = [
      { role: 'assistant', content: 'Hello! How can I help?' },
      { role: 'user', content: 'Hi there' },
      { role: 'assistant', content: 'Hello! I am ready.' }
    ];
    let message2 = "What is 2+2?";
    await runControllerLogic(model, systemPrompt, context2, message2);

    // Scenario 3: Broken context (Two users in a row?)
    console.log("\nTest 3: Broken Context (User, User)");
    let context3 = [
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'Msg 1' },
        { role: 'user', content: 'Msg 2' } // This shouldn't happen normally but let's see
    ];
    let message3 = "Msg 3";
    await runControllerLogic(model, systemPrompt, context3, message3);


  } catch (error) {
    console.error("Top Level Error:", error);
  }
}

async function runControllerLogic(model, systemPrompt, context, message) {
    try {
      let validHistory = [];
      let lastRole = 'model'; // System prompt ends with model

      // Filter out initial assistant messages
      let startIndex = 0;
      while (startIndex < context.length && context[startIndex].role === 'assistant') {
        startIndex++;
      }
      const cleanContext = context.slice(startIndex);

      // Build valid history
      for (const msg of cleanContext) {
        const currentRole = msg.role === 'assistant' ? 'model' : 'user';
        if (currentRole !== lastRole) {
          validHistory.push({
            role: currentRole,
            parts: [{ text: msg.content }]
          });
          lastRole = currentRole;
        }
      }

      // Ensure history ends with model (so next is user)
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
        console.log("Dropping trailing user message from history to maintain sequence.");
        validHistory.pop();
      }

      console.log("Constructed History:", JSON.stringify(validHistory, null, 2));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood." }] },
          ...validHistory
        ]
      });

      console.log(`Sending message: "${message}"`);
      const result = await chat.sendMessage(message);
      console.log("Response:", result.response.text());

    } catch (e) {
        console.error("Controller Logic Failed:", e.message);
        // console.error(JSON.stringify(e, null, 2));
    }
}

testChat();

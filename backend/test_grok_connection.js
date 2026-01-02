require('dotenv').config();
const OpenAI = require('openai');

async function testGrok() {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
        console.error("❌ GROK_API_KEY not found in .env");
        return;
    }

    console.log(`🔑 API Key found: ${apiKey.substring(0, 5)}...`);

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.x.ai/v1',
    });

    const modelName = "grok-4-1-fast-reasoning"; // Testing the specific model user requested

    console.log(`🚀 Testing model: ${modelName}...`);

    try {
        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a test assistant." },
                { role: "user", content: "Say hello and confirm your model name." }
            ],
            model: modelName,
            max_tokens: 100,
        });

        console.log("✅ Response received:");
        console.log(completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ Error testing Grok:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
}

testGrok();

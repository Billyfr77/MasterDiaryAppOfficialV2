const OpenAI = require('openai');

class GrokService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.client = null;
    this.init();
  }

  init() {
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: 'https://api.x.ai/v1', // Grok API Endpoint
      });
      console.log("✨ Pinnacle AI (Grok) Initialized");
    } else {
      console.warn("⚠️ GROK_API_KEY missing. AI disabled.");
    }
  }

  async generateText(prompt, systemInstruction = "You are a helpful assistant.", maxTokens = 2048) {
    if (!this.client) throw new Error("AI Service not configured (Missing GROK_API_KEY)");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        model: "grok-4-1-fast-reasoning", // Updated to grok-4 as per user confirmation
        max_tokens: maxTokens
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[Grok] Text Gen Error:", error.message);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = "", maxTokens = 4096) {
    if (!this.client) throw new Error("AI Service not configured");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction + "\nIMPORTANT: Return ONLY valid JSON. No markdown formatting." },
            { role: "user", content: prompt }
        ],
        model: "grok-4-1-fast-reasoning", 
        response_format: { type: "json_object" },
        max_tokens: maxTokens 
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("[Grok] JSON Gen Error:", error.message);
      throw error; 
    }
  }
}

module.exports = new GrokService();
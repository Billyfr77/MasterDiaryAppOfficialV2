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

  async generateText(prompt, systemInstruction = "You are a helpful assistant.") {
    if (!this.client) throw new Error("AI Service not configured (Missing GROK_API_KEY)");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        model: "grok-3", // Updated model name
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[Grok] Text Gen Error:", error.message);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = "") {
    if (!this.client) throw new Error("AI Service not configured");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction + "\nIMPORTANT: Return ONLY valid JSON. No markdown formatting." },
            { role: "user", content: prompt }
        ],
        model: "grok-3", // Updated model name
      });

      const content = completion.choices[0].message.content;
      // Robust cleaning for JSON parsing
      const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch (error) {
      console.error("[Grok] JSON Gen Error:", error.message);
      throw error;
    }
  }
}

module.exports = new GrokService();

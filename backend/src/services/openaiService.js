const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.client = null;
    this.init();
  }

  init() {
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
      console.log("✨ Pinnacle AI (OpenAI) Initialized");
    } else {
      console.warn("⚠️ OPENAI_API_KEY missing. AI disabled.");
    }
  }

  async generateText(prompt, systemInstruction = "You are a helpful assistant.") {
    if (!this.client) throw new Error("AI Service not configured");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini", 
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[OpenAI] Text Gen Error:", error.message);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = "") {
    if (!this.client) throw new Error("AI Service not configured");

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, 
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("[OpenAI] JSON Gen Error:", error.message);
      throw error;
    }
  }
}

module.exports = new OpenAIService();
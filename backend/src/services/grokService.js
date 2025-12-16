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
        model: "grok-4", // Updated to valid public model
        max_tokens: 4096 
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
        model: "grok-4",
        response_format: { type: "json_object" },
        max_tokens: 4096 
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("[Grok] JSON Gen Error:", error.message);
      // Fallback for models that might not support JSON mode perfectly yet
      try {
        console.warn("[Grok] JSON mode failed, retrying with text prompt...");
        const textCompletion = await this.generateText(prompt + "\n\nReturn your answer as a raw JSON object.", systemInstruction);
        const cleanText = textCompletion.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
      } catch (fallbackError) {
          console.error("[Grok] JSON fallback failed:", fallbackError.message);
          throw fallbackError;
      }
    }
  }
}

module.exports = new GrokService();
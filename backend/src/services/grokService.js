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
        model: "grok-4-1-fast-reasoning", 
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
            { role: "system", content: systemInstruction + "\nIMPORTANT: Return ONLY valid JSON. No markdown formatting. No preamble." },
            { role: "user", content: prompt }
        ],
        model: "grok-4-1-fast-reasoning", 
        max_tokens: maxTokens 
      });

      let content = completion.choices[0].message.content;
      
      // STRIP REASONING TAGS (e.g. <thought>...</thought>)
      content = content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
      
      // ROBUST JSON EXTRACTION
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1) {
          console.error("[Grok] Raw Content:", content);
          throw new Error("No JSON object found in response");
      }
      
      const jsonStr = content.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("[Grok] JSON Gen Error:", error.message);
      throw error; 
    }
  }
}

module.exports = new GrokService();
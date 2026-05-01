const OpenAI = require('openai');

class GrokService {
  constructor() {
    // Aggressively clean the key: trim whitespace first, then remove quotes
    const rawKey = process.env.GROK_API_KEY || '';
    this.apiKey = rawKey.trim().replace(/^["']|["']$/g, ''); 
    this.client = null;
    console.log(`[Grok] Loading Key: ${this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'NONE'}`);
    this.init();
  }

  init() {
    if (this.apiKey) {
      try {
          this.client = new OpenAI({
            apiKey: this.apiKey,
            baseURL: 'https://api.x.ai/v1', // Grok API Endpoint
          });
          console.log("✨ Pinnacle AI (Grok) Initialized");
      } catch (e) {
          console.error("AI Init Warning:", e.message);
      }
    } else {
      console.warn("⚠️ GROK_API_KEY missing. AI disabled.");
    }
  }

  getClient() {
      if (!this.client) this.init();
      return this.client;
  }

  /**
   * Prevents Token Bleed by truncating extremely large inputs
   */
  truncatePrompt(text, maxChars = 32000) {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    console.warn(`[Grok] Truncating prompt from ${text.length} to ${maxChars} chars to protect against bleed.`);
    return text.substring(0, maxChars) + "... [TRUNCATED FOR COST PROTECTION]";
  }

  async generateText(prompt, systemInstruction = "You are a helpful assistant.", maxTokens = 4096) {
    const client = this.getClient();
    if (!client) throw new Error("AI Service not configured (Missing GROK_API_KEY)");

    try {
      const completion = await client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: this.truncatePrompt(prompt) }
        ],
        model: "grok-4-1-fast-reasoning", 
        max_tokens: maxTokens,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[Grok] Text Gen Error:", error.message);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = "", maxTokens = 4096, retryCount = 0) {
    const client = this.getClient();
    if (!client) throw new Error("AI Service not configured");

    try {
      const completion = await client.chat.completions.create({
        messages: [
            { role: "system", content: systemInstruction + "\nIMPORTANT: Return ONLY valid JSON. No markdown formatting. No preamble." },
            { role: "user", content: this.truncatePrompt(prompt) }
        ],
        model: "grok-4-1-fast-reasoning", 
        max_tokens: maxTokens,
        temperature: 0.4
      });

      let content = completion.choices[0].message.content;
      
      // CRITICAL: Strip <thought> tags which break JSON parsing in reasoning models (if they appear)
      content = content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
      
      // Attempt to strip markdown code blocks if present
      content = content.replace(/^```json\s*/, '').replace(/```$/, '').trim();

      // ROBUST JSON EXTRACTION
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1) {
          throw new Error("No JSON object found in response");
      }
      
      const jsonStr = content.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(`[Grok] JSON Gen Error (Attempt ${retryCount + 1}):`, error.message);
      
      // --- SELF-HEALING PROTOCOL ---
      if (retryCount < 1) {
          console.warn("✨ Initiating Neural Self-Repair...");
          const repairInstruction = `
            SYSTEM ALERT: You generated invalid JSON in the previous turn.
            ERROR: ${error.message}
            
            **MISSION:** FIX the JSON. Return ONLY the corrected JSON object.
            Do not explain. Do not apologize. Just fix the syntax.
          `;
          // Retry with the repair instruction
          return this.generateJSON(prompt, repairInstruction, maxTokens, retryCount + 1);
      }
      
      throw error; 
    }
  }

  /**
   * SOVEREIGN VISION (NEURAL EYE): Analyzes site photos for hazards or progress
   * Uses grok-2-vision-1212 for state-of-the-art multimodal forensic auditing.
   */
  async analyzeImage(base64Image, prompt = "Analyze this construction site photo for safety hazards and work progress.", systemInstruction = "") {
    const client = this.getClient();
    if (!client) throw new Error("AI Service not configured");

    try {
      const completion = await client.chat.completions.create({
        model: "grok-2-vision-1212", 
        messages: [
          {
            role: "system",
            content: systemInstruction || "You are 'Neural Eye', a Military-Grade site auditor. Use forensic precision."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("[Neural Eye] Vision Error:", error.message);
      throw new Error("Vision Link Recalibrating. Ensure grok-2-vision-1212 is enabled.");
    }
  }

  /**
   * NEURAL BLUEPRINT (IMAGINE): Generates high-fidelity safety visualizations
   * Uses grok-imagine-image-pro for text-to-image generation.
   */
  async generateImagine(prompt) {
    const client = this.getClient();
    if (!client) throw new Error("AI Service not configured");

    try {
      console.log(`[Grok Imagine] Requesting image for: ${prompt}`);
      
      const response = await client.images.generate({
        model: "grok-imagine-image-pro",
        prompt: `Hyper-realistic professional construction site visualization: ${prompt}`,
      });

      console.log("[Grok Imagine] Raw Response Received");
      
      if (!response || !response.data || response.data.length === 0) {
        throw new Error("Empty response from Imagine Core.");
      }

      const imageUrl = response.data[0].url || response.data[0].b64_json;
      if (!imageUrl) throw new Error("No image data found in response.");

      return imageUrl;
    } catch (error) {
      console.error("[Neural Blueprint] Generation Error:", error.message);
      // Fallback: If it's a 404 or Model not found, it might be a model naming issue
      if (error.message.includes("404") || error.message.includes("model_not_found")) {
          throw new Error("Imagination Core naming mismatch. Please verify model: 'grok-imagine-image-pro'");
      }
      throw error;
    }
  }
}

module.exports = new GrokService();

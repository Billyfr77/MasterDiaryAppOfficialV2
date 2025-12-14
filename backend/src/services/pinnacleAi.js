const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

class PinnacleAI {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.client = null;
    this.init();
  }

  async init() {
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
      console.log("✨ Pinnacle AI (Gemini) Initialized");
      
      // DIAGNOSTIC: Check specific model availability manually
      // We perform a dummy generation on 'gemini-pro' to check access immediately on startup
      try {
          const model = this.client.getGenerativeModel({ model: "gemini-pro" });
          await model.generateContent("Test");
          console.log("✅ Model Access Confirmed: gemini-pro");
      } catch (e) {
          console.error("❌ Model Access Check Failed:");
          console.error(`   Error: ${e.message}`);
          console.error("   ACTION REQUIRED: Go to Google Cloud Console -> APIs & Services -> Enable 'Generative Language API'.");
      }

    } else {
      console.warn("⚠️ GEMINI_API_KEY missing. Pinnacle AI disabled.");
    }
  }

  get safetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  async generateText(prompt, systemInstruction = "", usePro = true) {
    if (!this.client) throw new Error("AI Service not configured (Missing API Key)");

    // Fallback chain: 1.5 Pro -> 1.5 Flash -> gemini-pro (Stable)
    const modelsToTry = usePro 
        ? ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]
        : ["gemini-1.5-flash", "gemini-pro"];

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            // console.log(`[PinnacleAI] Attempting with model: ${modelName}`);
            const model = this.client.getGenerativeModel({ 
                model: modelName,
                // Only send systemInstruction for 1.5 models to avoid 1.0 API errors
                systemInstruction: modelName.includes('1.5') ? systemInstruction : undefined, 
                safetySettings: this.safetySettings
            });

            // For gemini-pro (1.0), append system instructions to prompt
            let finalPrompt = prompt;
            if (!modelName.includes('1.5') && systemInstruction) {
                finalPrompt = `${systemInstruction}\n\nUser Query: ${prompt}`;
            }

            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            // console.warn(`[PinnacleAI] Failed with ${modelName}: ${error.message}`);
            lastError = error;
            // Continue to next model
        }
    }

    console.error("[PinnacleAI] All models failed.");
    throw lastError;
  }

  async generateJSON(prompt, systemInstruction = "") {
    if (!this.client) throw new Error("AI Service not configured");

    try {
      const model = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction,
        safetySettings: this.safetySettings
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.warn(`[PinnacleAI] JSON mode failed with 1.5 Flash: ${error.message}. Retrying with gemini-pro raw text...`);
      
      // Fallback: Ask gemini-pro for JSON text and parse it manually
      try {
          const text = await this.generateText(
              `${prompt}\n\nIMPORTANT: Output ONLY valid JSON. No markdown formatting.`, 
              systemInstruction, 
              false
          );
          // Clean potential markdown code blocks
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanText);
      } catch (e) {
          console.error("[PinnacleAI] JSON Fallback failed:", e.message);
          throw e;
      }
    }
  }
}

module.exports = new PinnacleAI();

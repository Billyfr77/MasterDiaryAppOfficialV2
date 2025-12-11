/*
 * MasterDiaryApp Official - AI Service Integration
 * Powered by Google Gemini
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API Key from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateContent = async (prompt, systemInstruction = "") => {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    throw new Error("Failed to generate AI content.");
  }
};

const generateJSON = async (prompt, systemInstruction = "") => {
    try {
      const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash", 
          generationConfig: { responseMimeType: "application/json" },
          systemInstruction: systemInstruction 
      });
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini AI JSON Error:", error);
      throw new Error("Failed to generate structured AI data.");
    }
  };

module.exports = { generateContent, generateJSON };

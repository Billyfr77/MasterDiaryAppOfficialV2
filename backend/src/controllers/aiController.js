const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Project, Diary, Staff, Equipment, Quote } = require('../models');

// Initialize Gemini (Lazy / Safe)
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// --- Helper to clean JSON ---
const cleanAndParseJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Failed:", text);
    return { error: "Failed to parse AI response" };
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!req.user) return res.status(401).json({ reply: 'Login required' });

    const userId = req.user.id;
    const projects = await Project.findAll({ where: { userId } }).catch(() => []);
    // Simplify data to save tokens
    const worldState = { 
      projects: projects.map(p => ({ name: p.name, status: p.status, value: p.estimatedValue })) 
    };
    
    const prompt = `You are a construction business assistant. 
    Context: ${JSON.stringify(worldState)}. 
    User: ${message}
    Answer concisely.`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text() || 'No response';
    res.json({ reply });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ reply: 'AI error: ' + error.message });
  }
};

const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ result: response.text() });
  } catch (error) {
    console.error("AI Generate Error:", error);
    res.status(500).json({ error: 'Generation failed' });
  }
};

const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `Summarize this construction document concisely:\n${text}`;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ summary: response.text() });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    res.status(500).json({ error: 'Summarization failed' });
  }
};

const analyzeQuote = async (req, res) => {
  try {
    const { items, location, description } = req.body;
    const prompt = `Analyze this construction quote. 
    Project: ${description} at ${location}. 
    Items: ${JSON.stringify(items)}.
    Provide a JSON object with fields: { "riskLevel": "Low/Med/High", "suggestions": [], "marketRateCheck": "comment" }`;
    
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Try to parse, else return text
    const text = response.text();
    let analysis = text;
    try { analysis = cleanAndParseJSON(text); } catch(e) {}
    
    res.json({ analysis });
  } catch (error) {
    console.error("AI Quote Analysis Error:", error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

const analyzeBusinessHealth = async (req, res) => {
  try {
    const { projects, staff, equipment, materials } = req.body;
    
    // Construct a specialized prompt for JSON output
    const prompt = `
      Analyze this construction business data and provide a strategic health report.
      
      Data:
      - Active Projects: ${projects?.length || 0}
      - Staff Count: ${staff?.length || 0}
      - Equipment Count: ${equipment?.length || 0}
      - Materials Items: ${materials?.length || 0}
      
      Return ONLY a valid JSON object (no markdown) with this exact structure:
      {
        "insights": [
          { "title": "Short Title", "message": "Insight description", "type": "info|warning|danger", "impact": "high|medium|low", "category": "Finance|Ops|Staff" }
        ],
        "alerts": [
          { "title": "Alert Title", "message": "Issue description", "priority": 1-10, "action": "Recommended action", "category": "Safety|Timeline|Budget" }
        ],
        "predictions": [
          { "trend": "Trend Name", "probability": "High/Low", "description": "Prediction details" }
        ]
      }
      
      Generate at least 2 insights and 1 alert based on typical construction risks (e.g., safety, delays, cost overruns).
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const analysis = cleanAndParseJSON(text);
    
    // Fallback if parsing fails totally
    if (analysis.error) {
        return res.json({ 
            analysis: { 
                insights: [{ title: "Analysis Error", message: "Could not parse AI response.", type: "warning" }], 
                alerts: [], 
                predictions: [] 
            } 
        });
    }

    res.json({ analysis });
  } catch (error) {
    console.error("AI Business Analysis Error:", error);
    // Return a safe fallback so the frontend doesn't crash
    res.json({ 
        analysis: { 
            insights: [{ title: "AI Offline", message: "Please check API Key configuration.", type: "warning" }], 
            alerts: [], 
            predictions: [] 
        } 
    });
  }
};

const getCloudAssistInsight = async (req, res) => {
  try {
    const { message } = req.body;
    const prompt = `As a construction expert, answer: ${message}`;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ insight: response.text() });
  } catch (error) {
    console.error("AI Cloud Assist Error:", error);
    res.status(500).json({ error: 'Insight failed' });
  }
};

const chatQuote = async (req, res) => {
  try {
    const { message, context } = req.body;
    // context: { items: [], dimensions: [], project: {}, settings: {} }
    
    const prompt = `
      You are an expert Senior Quantity Surveyor and Construction Estimator assistant.
      User Question: "${message}"
      
      Current Quote Context:
      - Project: ${context.project?.name || 'Unknown'} (${context.project?.location || ''})
      - Items: ${JSON.stringify(context.items || [])}
      - Dimensions/Takeoffs: ${JSON.stringify(context.dimensions || [])}
      
      Your Goal: Assist the user with estimating, material suggestions, or quote optimization.
      If the user asks to add items, suggest them clearly (e.g., "I recommend adding 50 sheets of drywall").
      
      Provide a helpful, professional, and concise response.
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("AI Quote Chat Error:", error);
    res.status(500).json({ error: 'Chat failed' });
  }
};

module.exports = { chatWithAI, generateContent, summarizeText, analyzeQuote, analyzeBusinessHealth, getCloudAssistInsight, chatQuote };
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Project, Diary, Staff, Equipment, Quote, Node } = require('../models');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: Get Model
const getModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Intelligent Search & Chat
 * Uses full DB context to answer business queries.
 */
const chatWithAI = async (req, res) => {
  const startTime = Date.now();
  console.log(`[AI] Request received at ${new Date().toISOString()}`);

  try {
    const { message, context } = req.body;
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
       console.error('[AI] Unauthorized request - missing user ID');
       return res.status(401).json({ reply: "Authentication failed. Please log in." });
    }

    const userId = req.user.id;
    console.log(`[AI] Processing for UserID: ${userId}`);
    console.log(`[AI] Input Message: "${message ? message.substring(0, 50) : 'NULL'}..."`);

    // 1. OMNISCIENT CONTEXT LOADING (Supercharge)
    console.log(`[AI] Starting DB Fetch...`);
    let projects = [], diaries = [], staff = [], equipment = [], quotes = [];
    
    try {
      [projects, diaries, staff, equipment, quotes] = await Promise.all([
        Project.findAll({ where: { userId }, order: [['updatedAt', 'DESC']] }).catch(err => { console.error('Project Fetch Error:', err); return []; }),
        Diary.findAll({
          where: { diaryType: 'paint' },
          limit: 50,
          order: [['date', 'DESC']],
          include: [{ model: Project, attributes: ['name'] }]
        }).catch(err => { console.error('Diary Fetch Error:', err); return []; }),
        Staff.findAll({ where: { userId } }).catch(err => { console.error('Staff Fetch Error:', err); return []; }),
        Equipment.findAll({ where: { userId } }).catch(err => { console.error('Equip Fetch Error:', err); return []; }),
        Quote.findAll({ where: { userId }, limit: 20, order: [['createdAt', 'DESC']] }).catch(err => { console.error('Quote Fetch Error:', err); return []; })
      ]);
      console.log(`[AI] DB Fetch Complete in ${Date.now() - startTime}ms`);
      console.log(`[AI] Data Loaded: ${projects.length} projects, ${diaries.length} diaries, ${staff.length} staff, ${equipment.length} equip, ${quotes.length} quotes`);
    } catch (dbError) {
      console.error(`[AI] DB Fetch FAILED:`, dbError);
      // Continue with empty data to avoid total crash
    }

    // 2. Format the "World State"
    const worldState = {
      currentTime: new Date().toLocaleString(),
      businessData: {
        projects: projects.map(p => ({ name: p.name, site: p.site, status: p.status, id: p.id })),
        team: staff.map(s => ({ name: s.name, role: s.role, costRate: s.payRateBase, chargeRate: s.chargeOutBase })),
        equipment: equipment.map(e => ({ name: e.name, status: e.status, cost: e.costRateBase })),
        recentWork: diaries.map(d => ({
          date: d.date,
          project: d.Project?.name || 'Unknown',
          revenue: d.totalRevenue,
          cost: d.totalCost,
          profit: d.totalRevenue - d.totalCost,
          productivity: d.productivityScore + '%'
        })),
        recentQuotes: quotes.map(q => ({
          name: q.name,
          total: q.totalRevenue,
          margin: q.marginPct + '%'
        }))
      }
    };
    console.log(`[AI] World State Constructed`);

    const systemPrompt = `
    You are the Intelligent Business Architect for this Painting & Decorating Enterprise.
    Your Role: Analyze the live business data below and provide strategic, high-value executive insights.
    
    LIVE BUSINESS STATE:
    ${JSON.stringify(worldState, null, 2)}

    Directives:
    1. precise financial analysis (margins, profit leaks).
    2. efficient resource allocation (staff, equipment).
    3. proactive project management.
    
    Answer the user's query based strictly on this real-time context. Be professional, concise, and authoritative.
    `;

    // 3. Generate Content
    try {
      console.log(`[AI] Initializing Gemini...`);
      // Clean context to ensure it starts with 'user' (since our system prompt ends with 'model')
      // and strictly alternates.
      let validHistory = [];
      let lastRole = 'model'; // The system prompt sequence ends with 'model'

      // Filter out any initial assistant messages if they come first (like the default greeting)
      let startIndex = 0;
      while (context && startIndex < context.length && context[startIndex].role === 'assistant') {
        startIndex++;
      }

      const cleanContext = (context || []).slice(startIndex);

      // Build valid history
      for (const msg of cleanContext) {
        const currentRole = msg.role === 'assistant' ? 'model' : 'user';
        
        // Only add if it alternates
        if (currentRole !== lastRole) {
          validHistory.push({
            role: currentRole,
            parts: [{ text: msg.content }]
          });
          lastRole = currentRole;
        }
      }
      
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
        validHistory.pop();
      }

      console.log(`[AI] History built with ${validHistory.length} messages.`);

      // Use gemini-1.5-flash
      const model = getModel();
      console.log(`[AI] Starting Chat Session...`);
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am ready to optimize your operations. What's the situation?" }],
          },
          ...validHistory
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      console.log(`[AI] Sending Message to Gemini...`);
      const result = await chat.sendMessage(message);
      console.log(`[AI] Gemini Response Received!`);
      const response = await result.response;
      const aiMessage = response.text();
      
      if (!aiMessage) {
          throw new Error("Empty response from Gemini");
      }

      console.log(`[AI] Sending Reply to Client. Length: ${aiMessage.length}`);
      res.json({ reply: aiMessage });

    } catch (apiError) {
      console.error('[AI] Gemini API CRITICAL FAILURE:', apiError.message);
      console.error('[AI] API Error Details:', apiError);
      
      // --- ENHANCED OFFLINE INTELLIGENCE (Rivaling Gemini) ---
      const lowerMsg = (message || '').toLowerCase();
      const { projects, team, equipment, recentWork, recentQuotes } = worldState.businessData;
      
      // Helper: Currency Formatter
      const fmt = (n) => `$${Number(n).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      
      // Intent Detection
      const intents = {
          finance: /money|profit|revenue|cost|margin|financial|earn|spend|budget|accounting/.test(lowerMsg),
          project: /project|job|site|status|work|progress|active/.test(lowerMsg),
          team: /staff|team|worker|employee|people|who|crew|hr/.test(lowerMsg),
          quote: /quote|estimate|bid|pricing|proposal/.test(lowerMsg),
          equip: /equipment|tool|van|vehicle|asset/.test(lowerMsg),
          greeting: /hello|hi|hey|start|help/.test(lowerMsg)
      };

      let reply = "### 🛡️ **Offline Executive Mode Active**\n";
      reply += "*Neural connection interrupted. Engaging local business intelligence core.*\n\n";

      if (projects.length === 0 && recentWork.length === 0) {
         reply += "⚠️ **ALERT: Zero Data Detected.**\n\n";
         reply += "I am scanning the database but finding **0 active projects** and **0 recent logs**.\n";
         reply += "**Diagnosis:** You may be logged into an empty account or a test environment.\n";
         reply += "**Recommendation:** Log out and switch to your primary administrative account to access historical data.";
      } 
      else if (intents.finance) {
          // Deep Financial Analysis
          const totalRev = recentWork.reduce((a, b) => a + (Number(b.revenue) || 0), 0);
          const totalCost = recentWork.reduce((a, b) => a + (Number(b.cost) || 0), 0);
          const totalProfit = totalRev - totalCost;
          const margin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
          
          // Project Profitability Ranking
          const projMap = {};
          recentWork.forEach(d => {
              const pName = d.project || 'Unassigned';
              if (!projMap[pName]) projMap[pName] = { rev: 0, cost: 0 };
              projMap[pName].rev += (Number(d.revenue) || 0);
              projMap[pName].cost += (Number(d.cost) || 0);
          });
          
          const rankedProjs = Object.entries(projMap)
              .map(([name, data]) => ({ name, profit: data.rev - data.cost, margin: data.rev > 0 ? ((data.rev - data.cost)/data.rev)*100 : 0 }))
              .sort((a, b) => b.profit - a.profit);

          reply += "#### 📊 **Financial Performance Report**\n";
          reply += `> **Net Period Profit:** ${fmt(totalProfit)}\n`;
          reply += `> **Profit Margin:** ${margin.toFixed(1)}% ${margin > 20 ? '✅' : '⚠️'}\n\n`;
          
          reply += "**Breakdown:**\n";
          reply += `| Category | Amount |\n| :--- | :--- |\n`;
          reply += `| Total Revenue | ${fmt(totalRev)} |\n`;
          reply += `| Total Costs | ${fmt(totalCost)} |\n\n`;

          if (rankedProjs.length > 0) {
              const top = rankedProjs[0];
              const bottom = rankedProjs[rankedProjs.length - 1];
              reply += "**Project Insights:**\n";
              reply += `🏆 **Top Earner:** ${top.name} (+${fmt(top.profit)})\n`;
              if (rankedProjs.length > 1) {
                  reply += `📉 **Underperformer:** ${bottom.name} (${fmt(bottom.profit)})\n`;
              }
          }

      } else if (intents.project) {
          // Advanced Project Tracking
          reply += "#### 🏗️ **Project Status Overview**\n";
          
          // Check for specific project
          const foundProj = projects.find(p => lowerMsg.includes(p.name.toLowerCase()));
          
          if (foundProj) {
              const logs = recentWork.filter(d => d.project === foundProj.name);
              const pRev = logs.reduce((a,b) => a + (Number(b.revenue)||0), 0);
              const pCost = logs.reduce((a,b) => a + (Number(b.cost)||0), 0);
              
              reply += `**Subject:** ${foundProj.name}\n`;
              reply += `- **Location:** ${foundProj.site || 'N/A'}\n`;
              reply += `- **Status:** ${foundProj.status.toUpperCase()}\n`;
              reply += `- **Financials:** ${fmt(pRev)} Rev / ${fmt(pCost)} Cost\n`;
              reply += `- **Activity:** ${logs.length} recent diary entries.\n`;
          } else {
              const active = projects.filter(p => p.status === 'active' || p.status === 'in_progress');
              reply += `**Active Sites (${active.length}):**\n`;
              active.slice(0, 5).forEach(p => reply += `- **${p.name}**: ${p.site} \n`);
              if (active.length > 5) reply += `*...and ${active.length - 5} others.*\n`;
              reply += `\n*Tip: Mention a specific project name for a detailed audit.*`;
          }

      } else if (intents.team) {
          // Workforce Intelligence
          const activeStaff = team.length;
          const totalBase = team.reduce((a,b) => a + (Number(b.costRate)||0), 0);
          const totalCharge = team.reduce((a,b) => a + (Number(b.chargeRate)||0), 0);
          const potentialProfit = (totalCharge - totalBase) * 8; // Daily

          reply += "#### 👷 **Workforce Analytics**\n";
          reply += `**Headcount:** ${activeStaff} Active Personnel\n`;
          reply += `**Potential Daily Profit:** ${fmt(potentialProfit)} (at 100% utilization)\n\n`;
          
          reply += "**Team Roster:**\n";
          team.slice(0, 8).forEach(s => {
              reply += `- **${s.name}** (${s.role}): Rate ${fmt(s.chargeRate)}/hr\n`;
          });
          if (team.length > 8) reply += `*(List truncated for brevity)*`;

      } else if (intents.quote) {
          // Pipeline Analysis
          const totalVal = recentQuotes.reduce((a,b) => a + (Number(b.total)||0), 0);
          const avgMargin = recentQuotes.reduce((a,b) => a + (Number(b.margin.replace('%',''))||0), 0) / (recentQuotes.length || 1);

          reply += "#### 📝 **Estimation Pipeline**\n";
          reply += `**Total Pipeline Value:** ${fmt(totalVal)}\n`;
          reply += `**Average Quoted Margin:** ${avgMargin.toFixed(1)}%\n\n`;
          
          reply += "**Recent Quotes:**\n";
          recentQuotes.slice(0, 5).forEach(q => {
              reply += `- **${q.name}**: ${fmt(q.total)} (${q.margin})\n`;
          });

      } else {
          // Executive Dashboard (Default)
          reply += "#### 🚀 **Executive Dashboard**\n";
          reply += "I have compiled a high-level summary of your operations:\n\n";
          
          reply += `| **Metric** | **Status** | **Value** |\n`;
          reply += `| :--- | :--- | :--- |\n`;
          reply += `| **Active Projects** | 🏗️ | ${projects.length} |\n`;
          reply += `| **Staff Force** | 👥 | ${team.length} |\n`;
          reply += `| **Recent Logs** | 📝 | ${recentWork.length} |\n`;
          reply += `| **Open Quotes** | 📄 | ${recentQuotes.length} |\n\n`;
          
          reply += "**Available Directives:**\n";
          reply += "- *\"Analyze financials\"* for profit/loss reports.\n";
          reply += "- *\"Show project details\"* or name a specific job.\n";
          reply += "- *\"List staff\"* for utilization data.\n";
          reply += "- *\"Check quotes\"* for pipeline status.";
      }

      res.json({ reply });
    }

  } catch (error) {
    console.error('AI Controller System Error:', error);
    res.status(500).json({
      reply: "System Malfunction. Please check server logs."
    });
  }
};

/**
 * Content Generation
 * Generates text based on a specific prompt (e.g. email, quote description).
 */
const generateContent = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = getModel();
    
    let finalPrompt = prompt;
    if (type === 'email') {
        finalPrompt = `Draft a professional email for a construction client with the following context: ${prompt}`;
    } else if (type === 'quote_description') {
        finalPrompt = `Write a detailed and professional description for a painting quote based on: ${prompt}`;
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ result: text });
  } catch (error) {
    console.error('[AI] Generation Error:', error);
    res.status(500).json({ error: "Failed to generate content" });
  }
};

/**
 * Text Summarization
 * Summarizes provided text.
 */
const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const model = getModel();
    const prompt = `Summarize the following text concisely, highlighting key points and action items:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (error) {
    console.error('[AI] Summarization Error:', error);
    res.status(500).json({ error: "Failed to summarize text" });
  }
};

/**
 * Intelligent Quote Analysis
 * Analyzes quote items and location to estimate duration and risks.
 */
const analyzeQuote = async (req, res) => {
  try {
    const { items, location, description, projectName } = req.body;
    
    // Construct a rich prompt
    const prompt = `
      You are an expert Senior Construction Estimator. Analyze the following project details:
      
      Project: ${projectName || 'Unnamed Project'}
      Description: ${description || 'No description provided'}
      Location (Lat/Lng): ${location ? JSON.stringify(location) : 'Not specified'}
      
      Resources/Items:
      ${JSON.stringify(items, null, 2)}
      
      Task:
      1. Estimate the realistic duration (in days) based on the labor/resources provided.
      2. Identify 3 potential risks based on the location (weather/logistics) and resource list.
      3. Suggest 1 specific efficiency improvement to save costs or time.
      
      Output strictly in JSON format:
      {
        "estimatedDuration": "X days",
        "risks": ["risk 1", "risk 2", "risk 3"],
        "efficiencyTip": "tip string",
        "weatherNote": "inference about likely weather impact based on location/season"
      }
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to clean JSON if Gemini adds markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.json({ analysis: JSON.parse(cleanText) });

  } catch (error) {
    console.error('[AI] Quote Analysis Error:', error);
    res.status(500).json({ 
      error: "Failed to analyze quote",
      fallback: {
        estimatedDuration: "Unknown",
        risks: ["AI Analysis unavailable"],
        efficiencyTip: "Check manual calculations",
        weatherNote: "N/A"
      }
    });
  }
};

module.exports = {
  chatWithAI,
  generateContent,
  summarizeText,
  analyzeQuote
};
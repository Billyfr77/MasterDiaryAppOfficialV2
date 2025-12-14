const pinnacleAi = require('../services/grokService');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document } = require('../models'); // Added Quote, Document models

// --- HELPER TO ATTACH FINANCIALS (copied from projectController for AI's context) ---
const attachFinancials = (project) => {
    if (!project) return null;
    const p = project.toJSON ? project.toJSON() : project;

    const contractValue = p.value ? parseFloat(p.value) : 0;
    const quotes = p.quotes || p.Quotes || [];
    const diaries = p.Diaries || p.diaries || [];

    const variationsValue = quotes
        .filter(q => q.status === 'approved')
        .reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);

    const livePrice = contractValue + variationsValue;
    const totalCost = diaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
    const totalDiaryRevenue = diaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
    const profit = livePrice - totalCost;

    return {
        ...p,
        financials: {
            contractValue,
            variationsValue,
            livePrice,
            totalCost,
            totalDiaryRevenue,
            profit,
            isProfitable: profit >= 0
        }
    };
};

// --- WORKFLOW GENERATION ---
const generateWorkflow = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    const systemPrompt = `
      You are an expert construction project manager using MasterDiaryOS. 
      Create a workflow structure based on the user's request.
      
      Output JSON format must match:
      {
        "nodes": [ { "id": "1", "type": "default", "data": { "label": "Task Name", "status": "pending" }, "position": { "x": 0, "y": 0 } } ],
        "edges": [ { "id": "e1-2", "source": "1", "target": "2", "type": "custom" } ]
      }
      
      Use node types: 'default' (tasks), 'decision' (logic), 'milestone' (important), 'approval' (sign-off), 'trigger' (automation), 'action' (automation).
    `;

    const workflowData = await pinnacleAi.generateJSON(`Create a workflow for: ${prompt || type}`, systemPrompt);
    res.json(workflowData);

  } catch (error) {
    console.error("AI Controller Error (Workflow):", error.message);
    res.status(500).json({ error: "Failed to generate workflow." });
  }
};

// --- SMART SUMMARY (DIARIES) ---
const generateDiarySummary = async (req, res) => {
    try {
        const { projectId } = req.body;
        
        const diaries = await Diary.findAll({
            where: { projectId }, 
            limit: 10, 
            order: [['date', 'DESC']]
        });

        if (!diaries.length) return res.json({ summary: "No recent diary entries to analyze." });

        const diaryText = diaries.map(d => `Date: ${d.date}, Weather: ${d.weather}, Notes: ${d.notes}`).join('\n');

        const systemPrompt = "You are a senior site foreman. Summarize the recent site activity into a concise, professional progress report. Highlight key achievements, delays, and weather impacts.";
        
        const summary = await pinnacleAi.generateText(`Summarize these logs:\n${diaryText}`, systemPrompt);
        
        res.json({ summary });

    } catch (error) {
        console.error("AI Controller Error (Summary):", error.message);
        res.status(500).json({ error: "Failed to generate summary." });
    }
};

// --- GLOBAL CHAT ASSISTANT (THE BRAIN) ---
const chatGlobal = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        let contextStr = "App Context: User is logged in.";
        let additionalData = ""; // Data fetched dynamically based on query
        const userId = req.user?.id; // Assuming user is authenticated

        if (context) {
            contextStr += `\nUser is currently on screen: ${context.screen || 'Unknown'}`;
            if (context.currentProjectId) {
                contextStr += `\nUser is viewing Project ID: ${context.currentProjectId}`;

                // --- AI TOOL: Fetch Project Details ---
                const projectKeywords = ["project", "finances", "budget", "cost", "profit", "value", "details", "status", "overview", "what about this project"];
                if (projectKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
                    const project = await Project.findByPk(context.currentProjectId, {
                        include: [
                            { model: Quote, as: 'quotes' },
                            { model: Diary, as: 'Diaries' },
                            { model: Allocation, as: 'Allocations', include: [{ model: Staff, as: 'staffResource' }, { model: Equipment, as: 'equipmentResource' }] },
                            { model: Document, as: 'documents' }
                        ]
                    });
                    if (project) {
                        const enhancedProject = attachFinancials(project); // Use helper for consistent financials
                        additionalData += `\n--- Project Data for ${project.name} ---\n${JSON.stringify(enhancedProject, null, 2)}\n---------------------------\n`;
                    } else {
                        additionalData += `\n(Could not retrieve details for Project ID: ${context.currentProjectId})\n`;
                    }
                }
            }
            if (context.currentQuoteId) {
                contextStr += `\nUser is viewing Quote ID: ${context.currentQuoteId}`;
                const quoteKeywords = ["quote", "estimate", "items", "cost", "revenue", "margin", "what about this quote"];
                if (quoteKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
                    const quote = await Quote.findByPk(context.currentQuoteId, {
                        include: [
                            { model: Project, as: 'project' }
                        ]
                    });
                    if (quote) {
                        additionalData += `\n--- Quote Data for ${quote.name} ---\n${JSON.stringify(quote.toJSON(), null, 2)}\n---------------------------\n`;
                    } else {
                        additionalData += `\n(Could not retrieve details for Quote ID: ${context.currentQuoteId})\n`;
                    }
                }
            }
        }

        const systemPrompt = `
            You are Pinnacle Copilot (powered by Grok), the elite AI operations manager for MasterDiaryOS.
            
            Your Mission: Optimize construction efficiency, safety, and profitability by providing intelligent assistance.
            
            Core Knowledge and Capabilities:
            - **MasterDiaryOS Features:** You understand Projects, Diaries, Resources, Quotes, Workflows, Safety, Clients, Equipment, Staff, and Documents.
            - **Projects:** Central hubs for all data. Financials (Contract Value, Live Price, Costs, Profit, Revenue) are calculated.
            - **Quotes:** Detailed estimates that include materials, staff, and equipment. Approved quotes update Project financials. You can explain how to create, edit, approve quotes, and convert them to invoices.
            - **Diaries:** Daily site logs. You can summarize recent activities.
            - **Resources:** Staff and Equipment. You understand their allocation status, including sick days and scheduled hours.
            - **Workflows:** Automation sequences for tasks like approving quotes or creating projects.
            - **Safety:** Important for compliance; you can explain safety forms and incident reporting.
            - **Data Access:** You have access to real-time, detailed application data when provided in your context.
            
            Tone: Professional, concise, authoritative yet helpful. Focus on actionable insights.
            
            Current Frontend Context:
            ${contextStr}
            
            Additional Backend Data (if relevant to query):
            ${additionalData || 'No specific additional data retrieved for this query.'}
        `;

        const reply = await pinnacleAi.generateText(message, systemPrompt);
        res.json({ reply });

    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({ error: "I'm having trouble connecting to Grok. Please check the API key." });
    }
};

module.exports = {
  generateWorkflow,
  generateDiarySummary,
  chatGlobal
};
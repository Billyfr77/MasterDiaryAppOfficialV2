const pinnacleAi = require('../services/grokService');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document, Node, MapAsset } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

// --- HELPER TO ATTACH FINANCIALS ---
const attachFinancials = (project) => {
    if (!project) return null;
    const p = project.toJSON ? project.toJSON() : project;
    const contractValue = p.value ? parseFloat(p.value) : 0;
    const quotes = p.quotes || p.Quotes || [];
    const diaries = p.Diaries || p.diaries || [];
    const variationsValue = quotes.filter(q => q.status === 'approved').reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);
    const livePrice = contractValue + variationsValue;
    const totalCost = diaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
    const totalDiaryRevenue = diaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
    const profit = livePrice - totalCost;
    return { ...p, financials: { contractValue, variationsValue, livePrice, totalCost, totalDiaryRevenue, profit, isProfitable: profit >= 0 } };
};

// --- WORKFLOW GENERATION (ARCHITECT MODE) ---
const generateWorkflow = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    const systemPrompt = `
      You are Pinnacle AI, the Master Workflow Architect.
      
      **Goal:** Design a SOPHISTICATED, LOGICAL, and FULLY INTEGRATED workflow.
      **Requirement:** Use DECISIONS, APPROVALS, and MILESTONES.
      **Speed Mandate:** Output **MINIFIED JSON** (no whitespace). Keep labels concise (e.g., "Email Client", not "Send email to client").
      
      **Node Types:**
      - 'trigger', 'action', 'decision', 'approval', 'milestone'.

      **Integrated Actions (actionType):**
      - 'create_project', 'create_invoice', 'assign_staff', 'create_quote', 'send_notification', 'log_audit'.

      **Output:** { "nodes": [], "edges": [] }

      **Layout Strategy:**
      - Start {x:250,y:0}. Flow y+150. Decision Branch x+/-200.

      **Node Data:**
      - Action: { "label": "Generate Invoice", "actionType": "create_invoice" }
      - Decision: { "label": "High Risk?" }
      
      Request: "${prompt || type}"
    `;
    const workflowData = await pinnacleAi.generateJSON(prompt, systemPrompt, 1800);

    // Validation
    if (workflowData.nodes && Array.isArray(workflowData.nodes)) {
        workflowData.nodes = workflowData.nodes.map(node => {
            if (!node.data) node.data = {};
            if (!node.data.status) node.data.status = 'pending';
            if (!node.data.label) node.data.label = 'New Step';
            return node;
        });
    }

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
        const diaries = await Diary.findAll({ where: { projectId }, limit: 10, order: [['date', 'DESC']] });
        if (!diaries.length) return res.json({ summary: "No recent diary entries to analyze." });
        const diaryText = diaries.map(d => `Date: ${d.date}, Weather: ${d.weather}, Notes: ${d.notes}`).join('\n');
        const systemPrompt = "You are a senior site foreman. Summarize the recent site activity into a concise, professional progress report for the client. Highlight key achievements and any weather delays. Be concise.";
        const summary = await pinnacleAi.generateText(`Summarize these logs:\n${diaryText}`, systemPrompt, 600);
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
        let additionalData = "";
        
        if (context) {
            contextStr += `\nUser is currently on screen: ${context.screen || 'Unknown'}`;
            if (context.currentProjectId) {
                contextStr += `\nUser is viewing Project ID: ${context.currentProjectId}`;
                const projectKeywords = ["project", "finances", "budget", "cost", "profit", "value", "details", "status", "overview", "what about this project"];
                if (projectKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
                    const project = await Project.findByPk(context.currentProjectId, { include: ['quotes', 'Diaries', 'documents'] });
                    if (project) {
                        const enhancedProject = attachFinancials(project);
                        additionalData += `\n--- Detailed Project Data ---\n${JSON.stringify(enhancedProject, null, 2)}\n---------------------------\n`;
                    }
                }
            }
        }

        const systemPrompt = `You are Pinnacle Copilot (powered by Grok), the elite AI operations manager for MasterDiaryOS. Your Mission: Optimize construction efficiency, safety, and profitability. Use the provided context and additional data to answer questions. **Be extremely concise and professional.** Context: ${contextStr}. Additional Data: ${additionalData || 'None.'}`;
        const reply = await pinnacleAi.generateText(message, systemPrompt, 800);
        res.json({ reply });
    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({ error: "I'm having trouble connecting to the AI service." });
    }
};

// --- SAFETY TASK ANALYSIS ---
const analyzeSafetyTask = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt required.' });
        const systemPrompt = `You are an expert Safety Officer (ISO 45001). Generate a valid JSON object with a single key "structure" which is an array. Each item in the array must be an object with three keys: "step", "hazard", and "control".`;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2048);
        res.json(result);
    } catch (error) {
        console.error("AI Safety Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to generate safety analysis." });
    }
};

// --- DOCUMENT ANALYSIS ---
const analyzeDocument = async (req, res) => {
    try {
        const { docId } = req.body;
        if (!docId) return res.status(400).json({ error: 'Document ID is required.' });
        const doc = await Document.findByPk(docId);
        if (!doc || !doc.metadata?.filePath) return res.status(404).json({ error: 'Document not found.' });
        
        const filePath = path.resolve(__dirname, '../../uploads', doc.metadata.filePath); 
        const fileBuffer = await fs.readFile(filePath);

        let textContent = '';
        if (doc.mimetype === 'application/pdf') {
            const data = await pdf(fileBuffer);
            textContent = data.text;
        } else if (doc.mimetype.startsWith('text/')) {
            textContent = fileBuffer.toString('utf-8');
        } else {
            return res.status(400).json({ error: 'Unsupported file type.' });
        }

        if (textContent.length > 12000) textContent = textContent.substring(0, 12000) + "... [Truncated]";

        const systemPrompt = `You are an expert document analyst. Summarize the following document concisely. Identify and list any key safety risks, compliance requirements, or critical dates.`;
        const analysis = await pinnacleAi.generateText(`Analyze this document:\n\n${textContent}`, systemPrompt, 1024);
        res.json({ analysis });
    } catch (error) {
        console.error("AI Document Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to analyze document." });
    }
};

// --- AI QUOTE GENERATION (Visual Builder - MAXIMUM POWER) ---
const generateQuote = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'A prompt describing the job is required.' });
        }

        const systemPrompt = `
            You are the "Elite Masterpiece Estimator" - the world's most advanced construction AI.
            Your goal is to generate a quote that is so accurate, complete, and professional that a human barely needs to edit it.

            **CONSTRUCTION LOGIC MANDATES:**
            1. **Elite Quantities:** Use standard industry spacing (e.g., Fencing: 2.4m rails, 600mm post depth, 2.1m post spacing). 
            2. **Waste Factors:** ALWAYS include 5-15% waste for materials (Timber, Concrete, Fasteners).
            3. **Productivity Rates:** Apply realistic hours based on job difficulty (e.g., standard fencer productivity is ~10-15m per day depending on type).
            4. **Soil/Terrain Defaults:** Unless specified, assume "Medium Soil", "Flat Terrain", and "Easy Access".
            5. **Completeness Engine:** You MUST include:
               - Site Prep & Protection
               - Waste Removal / Dump Fees
               - Consumables (Screws, Nails, Glue)
               - Travel & Mobilization
               - Final Cleanup

            **VISUAL GRAPH MANDATES:**
            1. **Smart Grouping:** Create "zone" nodes for major project phases (e.g., "Demolition & Prep", "Main Construction", "Finishing & Cleanup").
            2. **Architectural Layout:** 
               - Phases (Zones) at y=0, spaced by x=1000.
               - Resources (Glass) clustered vertically under their respective zones (y=300, 600, etc.).
            3. **Relational Edging:** EVERY resource node MUST connect to its Phase Zone.
            4. **Aesthetic Edges:** Use "orbit" for Labor-to-Zone and "gradient" for Material-to-Zone.

            **CLIENT-READY POLISH:**
            - Use professional, non-jargon labels (e.g., "Premium Treated Pine Paling Fence" instead of "fence").
            - Ensure costs are realistic industry benchmarks.

            **OUTPUT FORMAT:**
            RAW JSON ONLY.
            {
              "nodes": [
                { "id": "u1", "type": "zone", "label": "Phase Name", "x": 0, "y": 0 },
                { "id": "u2", "type": "glass", "label": "Item Name", "cost": 0, "quantity": 1, "nodeType": "material"|"staff"|"equipment", "x": 0, "y": 300 }
              ],
              "edges": [
                { "id": "e1", "source": "u2", "target": "u1", "animated": true, "style": { "stroke": "#..." }, "data": { "type": "orbit"|"gradient" } }
              ]
            }

            Request: "${prompt}"
            Internal Pass: Perform a "Real-Life Accuracy Pass" now. Recalculate everything. Ensure no missing items.
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 3000);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate visual quote." });
    }
};

// ...

// --- QUOTE CHAT (COPILOT - FAST) ---
const chatQuoteAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // OPTIMIZED: Zero-Context for speed.
        const systemPrompt = `
            You are "Pinnacle Quote Copilot".
            **Goal:** Quick, expert advice on the quote.
            **Format:** RAW JSON ONLY. No markdown.
            
            **Output:**
            {
                "reply": "Short, expert response.",
                "suggestedActions": [
                    { "type": "add_node", "label": "Item Name", "quantity": 1, "cost": 45.00, "category": "material" }
                ]
            }
            **Rule:** ALWAYS estimate a price ("cost") for suggested items.
        `;

        // OPTIMIZATION: 800 tokens for snappy response
        const result = await pinnacleAi.generateJSON(`User: "${message}". Context: ${JSON.stringify(context.items || []).substring(0, 500)}`, systemPrompt, 800);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Chat Error:", error.message);
        res.json({ reply: "I can help you build this quote." });
    }
};

// --- DIARY CHAT (COPILOT - ULTRA FAST) ---
const chatDiaryAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // Context reduction for speed
        const systemPrompt = `
            Diary Copilot. Be extremely quick.
            **CRITICAL:** If user describes work, output 'suggestedActions'.
            **Format:** RAW JSON. No markdown.
            { "reply": "Done.", "suggestedActions": [{ "type": "add_item", "label": "Item", "quantity": 1, "category": "material" }] }
        `;
        
        // 300 Tokens max for < 6s response
        const result = await pinnacleAi.generateJSON(`User: "${message}". Context: ${JSON.stringify(context).substring(0, 300)}`, systemPrompt, 300);
        res.json(result);
    } catch (error) {
        res.json({ reply: "Ready to log." });
    }
};

// --- AI MAP/SITE ANALYSIS ---
const analyzeMapZone = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: 'Project ID required.' });

        const project = await Project.findByPk(projectId, {
            include: [
                { model: Allocation, include: [Staff, Equipment] },
                { model: MapAsset },
                { model: Quote },
                { model: Diary },
                { model: Document }
            ]
        });

        if (!project) return res.status(404).json({ error: "Project not found." });

        // Financials (simplified for speed)
        const contract = parseFloat(project.value) || 0;
        const spend = (project.Diaries || []).reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
        
        const context = {
            name: project.name,
            status: project.status,
            financials: { contract, spend, profitable: contract > spend }
        };

        const systemPrompt = `
            You are the "Chief Construction Analyst". Provide a high-level strategic review.
            **Output Format:**
            {
                "executiveSummary": "One sentence overview.",
                "financialAnalysis": "Commentary on profit/spend.",
                "operationalReview": "Comment on activity.",
                "riskAssessment": "Identify risks.",
                "strategicAction": "One key recommendation."
            }
            Context: ${JSON.stringify(context)}
        `;

        const analysis = await pinnacleAi.generateJSON(`Analyze Project: ${project.name}`, systemPrompt, 1500);
        res.json({ analysis });

    } catch (error) {
        console.error("AI Map Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to generate analysis." });
    }
};

// --- AI MAP GENERATION (GEOCORE ULTRA) ---
const generateMapElements = async (req, res) => {
    try {
        const { prompt, center } = req.body;
        if (!center) return res.status(400).json({ error: "Center required." });

        const systemPrompt = `
            You are "GeoCore", the Master Geospatial Architect.
            Generate detailed Site Plans and Map Configurations.
            
            **Center:** Lat ${center.lat}, Lng ${center.lng}
            
            **Capabilities:**
            1. **Zones:** Create polygons for "Site Boundary", "Exclusion Zone", "Laydown Area", "Crane Radius".
            2. **Markers:** Place markers for "Gate", "Office", "First Aid", "Hazards".
            3. **Visuals:** Configure the map view (Satellite vs Road, 3D Tilt, Traffic Layer).

            **Output Format (JSON):**
            {
              "assets": [
                { "type": "ProjectZone"|"SafetyZone"|"LogisticsZone", "name": "Label", "shape": "polygon"|"point", "coordinates": [...], "color": "#hex" }
              ],
              "view": {
                "mapTypeId": "satellite" | "roadmap" | "hybrid",
                "tilt": 0 | 45,
                "layers": { "traffic": boolean, "transit": boolean }
              }
            }
            
            **Mandate:**
            - If prompt implies real-world context (e.g. "site access"), use 'satellite' + 'traffic'.
            - If prompt implies safety, create Red zones.
            
            Request: "${prompt}"
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2000);
        res.json(result);

    } catch (error) {
        console.error("AI Map Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate map elements." });
    }
};

// --- AI DIARY PARSING (Masterpiece Mode) ---
const parseDiaryLog = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Description required." });

        const systemPrompt = `
            You are a Master Site Architect.
            Convert this log into a **High-Fidelity Visual Work Map**.
            
            **Output Format:** 
            { 
              "nodes": [], 
              "edges": [], 
              "note": "Professional summary." 
            }

            **Architectural Logic:**
            1. **Time Phases:** Create "chronos" nodes for major day phases (e.g., "Site Mobilization", "Primary Works", "Post-Op Audit").
            2. **Clustering:** Place "diaryNode" resources (Staff, Equip, Materials) logically around their relevant Phase Pillar.
            3. **Aesthetic Edges:** 
               - Connect Staff/Equipment to Chronos via "orbit" edges.
               - Connect Materials to Chronos or related Staff via "gradient" edges.
            
            **Masterpiece Layout:** 
            - Phase 1 (Chronos): x=0, y=0.
            - Phase 2 (Chronos): x=500, y=0.
            - Phase 3 (Chronos): x=1000, y=0.
            - Resources: Cluster at y=300+ around their respective pillars.
            
            **Node Data Schema:**
            { "id": "u1", "type": "chronos"|"diaryNode", "label": "Name", "quantity": 1, "nodeType": "staff"|"material"|"equipment", "startTime": "HH:mm", "duration": 8 }
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2500);
        res.json(result);

    } catch (error) {
        console.error("AI Diary Parsing Error:", error.message);
        res.status(500).json({ error: "Failed to architect visual diary." });
    }
};

// --- DASHBOARD INTELLIGENCE ---
const generateDashboardInsights = async (req, res) => {
    try {
        const { stats } = req.body;
        if (!stats) return res.status(400).json({ error: "Stats required." });

        const systemPrompt = `
            You are "Neural Core", the AI brain. Analyze company stats.
            **Output:** { "insights": [{ "type": "critical"|"positive", "message": "...", "color": "rose"|"emerald" }] }
        `;

        const result = await pinnacleAi.generateJSON(`Stats: ${JSON.stringify(stats)}`, systemPrompt, 1024);
        res.json(result);

    } catch (error) {
        console.error("AI Dashboard Analysis Error:", error.message);
        res.json({ insights: [{ type: 'info', message: 'AI calibrating...', color: 'blue' }] });
    }
};

// --- GHOST NODE SUGGESTION ENGINE ---
const generateNodeSuggestions = async (req, res) => {
    try {
        const { selectedNode, existingNodes } = req.body;
        if (!selectedNode) return res.status(400).json({ error: "Selected Node required." });

        const systemPrompt = `
            You are "Pinnacle Architect", the AI construction forecaster.
            **Goal:** Suggest 1-3 logical NEXT STEPS based on the user's selection.
            **Context:** User selected "${selectedNode.data?.label || 'Unknown Item'}" (${selectedNode.data?.type || 'item'}).
            
            **Rules:**
            1. Suggestions must be pragmatic (e.g. "Drywall" -> needs "Joint Compound", "Screws", "Sander").
            2. If "Foundation" -> suggest "Rebar", "Concrete", "Formwork".
            3. Return RAW JSON only.
            
            **Output Schema:**
            {
              "suggestions": [
                { 
                  "label": "Item Name", 
                  "type": "material" | "staff" | "equipment", 
                  "reason": "Brief reason why" 
                }
              ]
            }
        `;

        const result = await pinnacleAi.generateJSON(`Selected: ${selectedNode.data?.label}`, systemPrompt, 1000);
        res.json(result);

    } catch (error) {
        console.error("AI Ghost Node Error:", error.message);
        res.status(500).json({ error: "Failed to generate suggestions." });
    }
};

const generateQuoteScope = async (req, res) => {
    try {
        const { items, projectName } = req.body;
        if (!items || !items.length) {
            return res.status(400).json({ error: 'Quote items are required to generate scope.' });
        }

        const systemPrompt = `
            You are an Elite Construction Project Manager.
            Convert these quote items into a professional, client-ready "Scope of Works".
            
            **MANDATES:**
            1. **Clarity:** Use non-technical language where possible.
            2. **Structure:** Use sections: "Overview", "Scope of Works", "Key Inclusions", "Exclusions", and "Assumptions".
            3. **Tone:** High-end, professional, and authoritative.
            4. **Specifics:** Mention quantities and key materials from the list.
            
            **Input Items:** ${JSON.stringify(items)}
            **Project Name:** ${projectName || 'General Works'}

            **Output Format:** 
            Markdown preferred for professional rendering.
        `;

        const result = await pinnacleAi.generateText(`Generate scope for: ${projectName}`, systemPrompt, true);
        res.json({ scope: result });

    } catch (error) {
        console.error("AI Scope Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate scope of works." });
    }
};

module.exports = {
  generateWorkflow,
  generateDiarySummary,
  chatGlobal,
  chatQuoteAssistant,
  chatDiaryAssistant,
  analyzeSafetyTask,
  analyzeDocument,
  generateQuote,
  generateQuoteScope,
  analyzeMapZone,
  generateMapElements,
  parseDiaryLog,
  generateDashboardInsights,
  generateNodeSuggestions
};
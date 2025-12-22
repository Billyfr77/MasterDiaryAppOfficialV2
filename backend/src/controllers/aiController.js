const pinnacleAi = require('../services/grokService');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document, Node, MapAsset, DiaryTemplate } = require('../models');
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
        const {projectId} = req.body;
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
                
                // Fetch deep project context
                const project = await Project.findByPk(context.currentProjectId, { 
                    include: [
                        { model: Quote, as: 'quotes' },
                        { model: Diary, limit: 5, order: [['date', 'DESC']] },
                        { model: Document, as: 'documents' }
                    ] 
                });
                
                if (project) {
                    const enhancedProject = attachFinancials(project);
                    additionalData += `\n--- Detailed Project Data ---\n${JSON.stringify(enhancedProject, null, 2)}\n`;
                    
                    // Specific analysis if viewing a diary
                    if (context.currentDiaryId) {
                        const diary = await Diary.findByPk(context.currentDiaryId);
                        if (diary) {
                            additionalData += `\n--- Current Diary Canvas Data ---\n${JSON.stringify(diary.canvasData, null, 2)}\n`;
                        }
                    }
                }
            }
        }

        const systemPrompt = `
            You are "Pinnacle Core", the master intelligence of MasterDiaryOS.
            You have access to all project data, quotes, diaries, and live canvas states.
            
            **Mission:** 
            Analyze data deeply to provide strategic insights. 
            Identify financial leaks, productivity gaps, or missing resources.
            
            **Available Data:**
            - Projects, Clients, Staff, Equipment, Quotes, and Invoices.
            - Real-time Canvas (nodes, links, duration).
            
            **Rules:**
            - Be concise but extremely insightful.
            - If data is provided, use numbers and facts.
            - Offer optimization advice proactively.
            
            Context: ${contextStr}
            Additional Data: ${additionalData || 'No specific project data in current view.'}
        `;

        const reply = await pinnacleAi.generateText(message, systemPrompt, 1200);
        res.json({ reply });
    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({ error: "Intelligence core is recalibrating." });
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
            You are "Pinnacle Architect", the world's most advanced Construction Estimator AI (Level 100).
            **Mission:** Construct a FLAWLESS, COMPLETE, and INTELLIGENT visual quote blueprint.
            
            **INTELLIGENCE MANDATES (The "Brain"):**
            1. **Hyper-Completeness:** Never add a primary item without its ancillaries.
               - *Example:* "Drywall" -> MUST include "Stud Adhesive", "Screws", "Joint Tape", "Base Coat", "Top Coat", "Sanding Discs".
               - *Example:* "Tile" -> MUST include "Adhesive", "Grout", "Spacers", "Silicone", "Waterproofing (if wet area)".
            2. **Sequencing Logic:** Organize the job into logical chronological ZONES (Phases).
               - *Standard Flow:* Prep/Demo -> Structure/Rough-in -> Fix/Sheeting -> Fitout -> Finishes -> Cleanup.
            3. **Realistic Quantities:** Use industry-standard coverage rates (e.g., Paint = 10m²/L, 2 coats). Always add 10% waste.
            4. **Labor & Equip:** Do not forget the human element. If there is heavy material, add "Laborers". If digging, add "Excavator".

            **VISUAL LAYOUT ENGINE (The "Canvas"):**
            - **Zones (Phases):** Create 'zone' nodes at Y=0, spaced X=1000 apart.
            - **Items (Glass Nodes):** Cluster items vertically under their Zone (Y=300, 600, 900...).
            - **Edges:**
              - 'orbit' edge for Labor/Equipment -> Zone.
              - 'gradient' edge for Materials -> Zone.
              - 'neon' edge for critical dependencies (e.g., Waterproofing -> Tile).

            **OUTPUT FORMAT (RAW JSON):**
            {
              "nodes": [
                { "id": "z1", "type": "zone", "label": "Phase 1: Preparation", "x": 0, "y": 0 },
                { "id": "i1", "type": "glass", "label": "Skip Bin (4m)", "cost": 450, "quantity": 1, "nodeType": "equipment", "x": 0, "y": 300 }
              ],
              "edges": [
                { "id": "e1", "source": "z1", "target": "i1", "animated": true, "data": { "type": "orbit" } }
              ]
            }

            Request: "${prompt}"
            **Action:** Execute Deep-Scan estimation now. Leave no nut or bolt unaccounted for.
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 3500);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate visual quote." });
    }
};

// --- QUOTE CHAT (COPILOT - STRATEGIC) ---
const chatQuoteAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // Deep context analysis
        const itemNames = (context?.items || []).map(i => i.name).join(', ');
        
        const systemPrompt = `
            You are "Pinnacle Strategist", the Strategic Construction Consultant.
            
            **Goal:** Analyze the current quote context and the user's request to provide HIGH-VALUE suggestions.
            **Current Quote Includes:** ${itemNames || "Nothing yet"}
            
            **Analysis Logic:**
            1. **Gap Analysis:** Look for missing dependencies. (e.g., User has "Bricks" but no "Sand/Cement" -> Suggest it).
            2. **Upsell/Value:** Suggest premium alternatives or necessary add-ons (e.g., "Add scaffolding for safety?").
            3. **Direct Response:** Answer the user's specific query clearly.

            **Output Format (RAW JSON):**
            {
                "reply": "Clear, professional advice explaining WHY you are suggesting these items.",
                "suggestedActions": [
                    {
                        "type": "add_node", 
                        "label": "Item Name", 
                        "quantity": 1, 
                        "cost": 0.00, 
                        "category": "material|staff|equipment"
                    }
                ]
            }
            
            **Rule:** If suggesting items, ensure 'cost' is a realistic market estimate.
        `;

        const result = await pinnacleAi.generateJSON(`User: "${message}"`, systemPrompt, 1500);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Chat Error:", error.message);
        res.json({ reply: "I can help you optimize this quote. What are we building?", suggestedActions: [] });
    }
};

// --- DIARY CHAT (COPILOT - INTELLIGENT SPEED) ---
const chatDiaryAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        const systemPrompt = `
            You are "Site Director AI".
            **Mission:** Assist with diary logs instantly.
            **Intelligence:** Detect IMPLIED resources (e.g., "Digging trench" -> Suggest "Excavator", "Shovel", "Spotter").
            **Speed:** Concise JSON only.
            
            **Output:**
            { 
                "reply": "Brief confirmation or clarification.", 
                "suggestedActions": [
                    { "type": "add_item", "label": "Item Name", "quantity": 1, "category": "material|staff|equipment" }
                ] 
            }
        `;
        
        const result = await pinnacleAi.generateJSON(`User: "${message}". Context: ${JSON.stringify(context).substring(0, 500)}`, systemPrompt, 600);
        res.json(result);
    } catch (error) {
        res.json({ reply: "Ready to log.", suggestedActions: [] });
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

// --- AI DIARY PARSING (Masterpiece Mode - LEVEL 100) ---
const parseDiaryLog = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Description required." });

        const systemPrompt = `
            You are "Pinnacle Site Architect" (Level 100 Intelligence).
            **Mission:** Convert a raw site log into a COMPLETE, CHRONOLOGICAL Visual Work Map.
            
            **HYPER-INFERENCE MANDATE:**
            - **Never trust the user is complete.** If they say "Poured slab", YOU must add: "Concrete Pump", "Vibrator", "Concreters", "Finishing Tools".
            - If "Excavation", add "Spotter", "Tip Truck" (if removal implied).
            
            **ARCHITECTURAL LOGIC:**
            1. **Chronos Pillars:** Create 'chronos' nodes for time blocks (e.g. "Morning Setup", "Main Works", "Site Pack-up").
            2. **Smart Clustering:** Group resources (Staff/Equip/Mat) under their relevant Chronos pillar.
            3. **Connectivity:** Link every resource to a Chronos node.

            **VISUAL LAYOUT:**
            - **Pillars:** Y=0, X=0, 600, 1200...
            - **Resources:** Cluster vertically Y=300+ under pillars.

            **OUTPUT JSON:**
            { 
              "nodes": [
                { "id": "c1", "type": "chronos", "label": "Phase Name", "x": 0, "y": 0, "startTime": "07:00", "duration": 2 },
                { "id": "r1", "type": "diaryNode", "label": "Item Name", "nodeType": "staff|material|equipment", "quantity": 1, "x": 0, "y": 300 }
              ], 
              "edges": [
                { "id": "e1", "source": "c1", "target": "r1", "data": { "type": "orbit|gradient" } }
              ],
              "note": "Professional summary of the day." 
            }
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2000);
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

// --- SMART CHAT ASSISTANT (Advanced Logic) ---
const chatSmartAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const { canvasItems = [], canvasTemplates = [] } = context || {};

        // Fetch available templates for AI awareness
        const templates = await DiaryTemplate.findAll({ 
            attributes: ['id', 'name', 'description', 'category'],
            limit: 20 
        });

        const templateContext = templates.map(t => `${t.name} (ID: ${t.id}) - ${t.description}`).join(', ');
        const canvasContext = canvasItems.map(i => `${i.name} (${i.type})`).join(', ');

        const systemPrompt = `
            You are "Pinnacle AI", the advanced construction diary assistant.
            
            **Capabilities:**
            1. **Resource Logging:** If user says "Add 2 carpenters", suggest creating staff nodes.
            2. **Template Suggestion:** If user asks for "Concrete pour setup", check available templates and suggest linking one.
            3. **Canvas Analysis:** Analyze current items on canvas to provide context-aware advice (e.g., "You have concrete but no pump?").
            
            **Current Canvas:** ${canvasContext || 'Empty'}
            **Available Templates:** ${templateContext || 'None'}

            **Output Format (JSON Only):**
            {
                "reply": "Conversational response.",
                "suggestedNodes": [
                    { "name": "Label", "type": "staff|equipment|material", "quantity": 1, "costRate": 0, "chargeRate": 0 }
                ],
                "suggestedTemplates": [
                    { "id": "uuid", "name": "Template Name" } 
                ]
            }

            **Rules:**
            - Keep "reply" concise and helpful.
            - Only populate "suggestedTemplates" if a match is found in the provided list.
            - "suggestedNodes" are for ad-hoc items not in a template.
        `;

        // 1000 tokens for smart but cost-effective responses
        const result = await pinnacleAi.generateJSON(`User: "${message}"`, systemPrompt, 1000);
        res.json(result);

    } catch (error) {
        console.error("AI Smart Chat Error:", error.message);
        res.status(500).json({ error: "AI Assistant is offline." });
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
  generateNodeSuggestions,
  chatSmartAssistant
};

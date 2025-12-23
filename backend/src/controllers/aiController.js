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
        const { prompt, historicalContext = [] } = req.body;
        if (!prompt) return res.status(400).json({ error: 'A prompt describing the job is required.' });

        const systemPrompt = `
            You are "Pinnacle Architect", the world's most advanced Construction Estimator AI.
            **Mission:** Construct a FLAWLESS, ID-DRIVEN visual quote blueprint optimized by real-world performance data.
            
            **HISTORICAL JOB DNA (Cross-Job Learning):**
            ${historicalContext.length > 0 ? JSON.stringify(historicalContext) : 'No direct history found. Use industry benchmarks.'}

            **STRUCTURAL MANDATES:**
            1. **Specialized Nodes:** Use 'zone' (Phase), 'dimension' (Area), and 'glass' (Resources).
            2. **Unique Identifiers:** Every node must have a unique 'id'.
            3. **Relational Edges:** Create explicit edges linking Resources -> Areas -> Phases.
            4. **Optimization:** If history shows similar jobs took 20% longer, adjust your estimates proactively.

            **OUTPUT FORMAT (RAW JSON ONLY):**
            {
              "nodes": [
                { "id": "z1", "type": "zone", "label": "Phase 1", "x": 0, "y": 0 },
                { "id": "d1", "type": "dimension", "label": "Main Area", "x": 0, "y": 300 },
                { "id": "i1", "type": "glass", "label": "Concrete", "cost": 250, "quantity": 10, "nodeType": "material", "x": 0, "y": 600 }
              ],
              "edges": [...]
            }

            Request: "${prompt}"
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 3500);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate visual quote." });
    }
};

// --- QUOTE CHAT (COPILOT - STRATEGIC & GRAPH AWARE) ---
const chatQuoteAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const { items = [], nodes = [], edges = [] } = context || {};
        
        // Deep context analysis
        const nodesContext = nodes.map(n => `[${n.id}] ${n.data?.label || n.label} (${n.type})`).join('\n');
        const graphContext = edges.map(e => `[${e.source}] -> [${e.target}]`).join('\n');
        
        const systemPrompt = `
            You are "Pinnacle Strategist", the master of ID-driven quote optimization.
            
            **CAPABILITIES:**
            1. **Circuit Awareness:** You can see the graph IDs and connections.
            2. **Direct Editing:** Suggest changes to existing nodes via 'suggestedActions'.
               - Format: { "type": "edit_node", "nodeId": "ID", "updates": { "quantity": X, "cost": Y } }
            3. **Gap Analysis:** Look for items mentioned in nodes that lack supporting materials.

            **Current Quote Graph:**
            --- NODES ---
            ${nodesContext || "Empty"}
            
            --- CONNECTIONS ---
            ${graphContext || "None"}

            **Output Format (JSON Only):**
            {
                "reply": "Conversational strategic advice.",
                "suggestedNodes": [...],
                "suggestedActions": [
                    { "type": "edit_node", "nodeId": "id", "updates": { "quantity": 5 } },
                    { "type": "add_node", "label": "Name", "cost": 0, "category": "material" }
                ]
            }
        `;

        const result = await pinnacleAi.generateJSON(`User: "${message}"`, systemPrompt, 1500);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Chat Error:", error.message);
        res.json({ reply: "I can help you optimize this quote.", suggestedActions: [] });
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
            **Mission:** Convert a raw site log into a COMPLETE, SPECIALIZED, and CHRONOLOGICAL Visual Site Map.
            
            **HYPER-INFERENCE MANDATE:**
            - Never trust the user is complete. Infer necessary resources (e.g., "Poured slab" -> add "Concrete Pump", "Concreters").
            
            **SPECIALIZED NODE ECOSYSTEM:**
            1. **'chronos'**: The pillar of time. Use for shifts (e.g., "Morning Shift").
            2. **'delay'**: The friction node. Use for weather or delays (e.g., "Rain stopped work for 2hrs").
            3. **'impact'**: Site condition analysis (e.g., "Muddy site decreased productivity").
            4. **'neuralPrism'**: The brain. Suggest one if strategic analysis is implied.
            5. **'wormhole' / 'zone'**: Container nodes for large logical groups.
            6. **'dimension'**: For measurements (e.g., "Room is 5x4m").
            7. **'allowance'**: For extra payouts (e.g., "Height allowance for 2 painters").
            8. **'diaryNode'**: Standard resources (nodeType: staff | equipment | material).

            **ARCHITECTURAL LOGIC:**
            - **Chronos Pillars:** Create pillars at Y=0, X=0, 600, 1200...
            - **Resource Clustering:** Vertically cluster resources (Y=300+) under their Chronos pillar.
            - **Plug-ins:** Connect 'delay' and 'neuralPrism' nodes DIRECTLY to the 'chronos' pillars.

            **OUTPUT JSON:**
            { 
              "nodes": [
                { "id": "c1", "type": "chronos", "label": "Phase Name", "x": 0, "y": 0, "startTime": "07:00", "duration": 8 },
                { "id": "d1", "type": "delay", "label": "Rain Delay", "x": 0, "y": 300, "duration": 2, "weatherType": "rain" },
                { "id": "r1", "type": "diaryNode", "label": "Item Name", "nodeType": "staff|material|equipment", "quantity": 1, "x": 0, "y": 600 }
              ], 
              "edges": [
                { "id": "e1", "source": "c1", "target": "d1", "animated": true },
                { "id": "e2", "source": "c1", "target": "r1", "animated": true, "data": { "type": "orbit|gradient" } }
              ],
              "note": "A high-level professional summary of the day." 
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

// --- SMART CHAT ASSISTANT (Advanced Logic - V3) ---
const chatSmartAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const { canvasItems = [], extraNodes = [], edges = [], canvasTemplates = [] } = context || {};

        // Fetch available templates for AI awareness
        const templates = await DiaryTemplate.findAll({ 
            attributes: ['id', 'name', 'description', 'category'],
            limit: 20 
        });

        const templateContext = templates.map(t => `${t.name} (ID: ${t.id})`).join(', ');
        
        // Item List
        const itemsContext = canvasItems.map(i => `[${i.id}] ${i.name} (${i.type}, Dur:${i.duration}H)`).join('\n');
        
        // Special Nodes (Chronos, Delay, Task, etc.)
        const extrasContext = extraNodes.map(n => {
            let details = '';
            if (n.type === 'chronos') details = `Start:${n.data?.startTime}, End:${n.data?.finishTime}, Dur:${n.data?.duration}`;
            if (n.type === 'delay') details = `Weather:${n.data?.weatherType}, Dur:${n.data?.duration}`;
            if (n.type === 'allowance') details = `Rate:$${n.data?.rate}, Type:${n.data?.allowanceType}`;
            if (n.type === 'taskNode') details = `Label:${n.data?.label}, Planned:${n.data?.plannedHours}, Actual:${n.data?.actualHours}`;
            return `[${n.id}] ${n.data?.label || n.type.toUpperCase()} (${n.type}) - ${details}`;
        }).join('\n');

        // Connections (The Circuit)
        const graphContext = edges.map(e => `[${e.source}] --(${e.type || 'link'})--> [${e.target}]`).join('\n');

        const systemPrompt = `
            You are "Pinnacle AI", the master Neural OS coordinator.
            
            **CAPABILITIES:**
            1. **Node Creator:** Suggest adding nodes (especially 'taskNode' for specific work units).
            2. **Node Editor:** Identify existing IDs and suggest edits via 'suggestedActions' { "type": "edit_node", "nodeId": "...", "updates": {...} }.
            3. **Task Planner:** Link resources to 'taskNode' to track progress.
            4. **Simulation Trigger:** If user asks "What if...", describe the impact and suggest node adjustments.

            **Visual Graph Context:**
            --- RESOURCES ---
            ${itemsContext || 'None'}
            
            --- LOGIC NODES ---
            ${extrasContext || 'None'}
            
            --- CONNECTIONS ---
            ${graphContext || 'None'}

            **Output Format (JSON Only):**
            {
                "reply": "Authoritative response.",
                "suggestedNodes": [
                    { "name": "Task Name", "type": "taskNode", "plannedHours": 8 }
                ],
                "suggestedActions": [
                    { "type": "edit_node", "nodeId": "id", "updates": { "plannedHours": 12 } },
                    { "type": "remove_node", "nodeId": "id" }
                ],
                "suggestedTemplates": [...]
            }
        `;

        const result = await pinnacleAi.generateJSON(`User: "${message}"`, systemPrompt, 1500);
        res.json(result);

    } catch (error) {
        console.error("AI Smart Chat Error:", error.message);
        res.status(500).json({ error: "AI Assistant is offline." });
    }
};

// --- NEURAL PRISM ANALYSIS (ULTIMATE POWER MODE - Grok-4 Spec) ---
const analyzePrismVelocity = async (req, res) => {
    try {
        const { context, history = [] } = req.body;
        if (!context) return res.status(400).json({ error: "Context required." });

        const command = context.command || 'auto';
        const quotedData = context.quotedData || null;

        const systemPrompt = `
            You are "Neural Progress Prism", the central intelligence of MasterDiaryOS.
            **Mission:** Single point of truth for causality, prediction, and intervention.
            
            **TEMPORAL & BASELINE CONTEXT:**
            - HISTORICAL TRENDS (Last 5 Days): ${JSON.stringify(history)}
            - APPROVED QUOTE: ${quotedData ? JSON.stringify({
                totalRevenue: quotedData.totalRevenue,
                totalCost: quotedData.totalCost,
                margin: quotedData.marginPct,
                staff: (quotedData.staff || []).map(s => `${s.name}: ${s.hours}h`),
                equip: (quotedData.equipment || []).map(e => `${e.name}: ${e.days}d`)
            }) : 'No baseline found.'}

            **INTELLIGENCE CORE MANDATES:**
            1. **Structured Causal Path:** Return an array 'causalPath' tracing the root cause to final effect. Each step: { "nodeId": "...", "label": "...", "effect": "..." }.
            2. **Drift Dashboard:** Calculate 'driftStats' for: Time, Cost, Labour, Equipment, Material, Zone, Task. 
               Include: "variancePct", "absoluteVariance", "trend" ("up"|"down"|"stable"), "severity" ("low"|"med"|"high").
            3. **Idle & Waste Detection:** 
               - Detect **Equipment Idle Time** if hours are logged but no tasks are linked or velocity is low.
               - Detect **Material Waste** if actual quantities exceed quoted estimates without corresponding progress.
            4. **Margin Forecasting:** Predict "finalMargin" and "marginRisk" ("low"|"med"|"critical").
            5. **Interventions:** Suggest "stabilizers" (nodes to add) and "sequencingChanges".
            6. **Insights:** Group by "severity" (critical|warning|info). Include "nodeReferences" (IDs).

            **Output Format (RAW JSON ONLY):**
            {
                "velocity": 1.25, 
                "burnRate": "$145/hr",
                "currentMargin": "22%",
                "predictedFinalMargin": "18%",
                "marginRisk": "med",
                "status": "optimal" | "stable" | "critical",
                "completionDrift": "+2.5 Days",
                "causalPath": [
                    { "nodeId": "d1", "label": "Rain Delay", "effect": "Stopped Work" },
                    { "nodeId": "s1", "label": "Crew A", "effect": "Idle / Non-Productive" },
                    { "nodeId": "t1", "label": "Fencing", "effect": "Schedule Slip" }
                ],
                "driftStats": {
                    "labour": { "variancePct": 15, "absoluteVariance": "12h", "trend": "up", "severity": "med" },
                    "cost": { "variancePct": 8, "absoluteVariance": "$450", "trend": "up", "severity": "low" },
                    "task": { "variancePct": 20, "absoluteVariance": "1 day", "trend": "up", "severity": "high" }
                },
                "insights": [
                    { "severity": "critical", "type": "cost", "text": "...", "nodeReferences": ["s1", "d1"], "tacticalAdvice": "..." }
                ],
                "scenarios": [...],
                "suggestedNodes": [...]
            }
        `;

        const result = await pinnacleAi.generateJSON(`Neural Command: ${command}`, systemPrompt, 2500);
        res.json(result);

    } catch (error) {
        console.error("AI Prism Analysis Error:", error.message);
        res.json({ velocity: 1.0, status: "stable", insights: [{ severity: "info", text: "Engine recalibrating...", priority: 3 }] });
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
  chatSmartAssistant,
  analyzePrismVelocity // EXPORT PRISM
};

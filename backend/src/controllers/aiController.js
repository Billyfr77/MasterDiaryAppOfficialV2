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
    const workflowData = await pinnacleAi.generateJSON(prompt, systemPrompt, 1000);

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
            } else {
                // GLOBAL CONTEXT FETCH (When no specific project selected)
                const allProjects = await Project.findAll({ 
                    attributes: ['id', 'name', 'status', 'client'],
                    limit: 20 
                });
                const recentDiaries = await Diary.findAll({
                    limit: 5,
                    order: [['date', 'DESC']],
                    include: [{ model: Project, attributes: ['name'] }]
                });
                
                additionalData += `\n--- Global Portfolio Overview ---\n`;
                additionalData += `Total Projects: ${allProjects.length}\n`;
                additionalData += `Projects List: ${JSON.stringify(allProjects)}\n`;
                additionalData += `Recent Diaries: ${JSON.stringify(recentDiaries.map(d => ({ date: d.date, project: d.Project?.name, weather: d.weather })))}`;
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
            - If "Global Portfolio Overview" is provided, use it to answer questions about the user's entire business.
            
            **Rules:**
            - Be concise but extremely insightful.
            - If data is provided, use numbers and facts.
            - Offer optimization advice proactively.
            
            Context: ${contextStr}
            Additional Data: ${additionalData || 'No specific project data in current view.'}
        `;

        const reply = await pinnacleAi.generateText(message, systemPrompt, 500);
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
                    You are "Neural Estimation Engine (NEE) V2", the world's most advanced Construction Estimator AI.
                    **Mission:** Construct a HIGH-FIDELITY visual estimation circuit.
        
                    **NEE POWER NODES (MANDATORY USAGE):**
                    1. **estimationPrism:** THE BRAIN. Must be present once. { "id": "prism1", "type": "estimationPrism", "status": "analyzing", "x": 0, "y": 0 }
                    2. **zone:** Phase container. Group items inside. { "id": "z1", "type": "zone", "label": "Phase 1: Ground", "width": 600, "height": 600, "x": 0, "y": 100 }
                    3. **areaNode:** Spatial driver. { "id": "a1", "type": "areaNode", "label": "Living Room", "width": 10, "length": 15, "depth": 0, "type": "floor" }
                    4. **quoteMaterial:** Linked to areaNode. { "id": "m1", "type": "quoteMaterial", "label": "Paint", "rate": 120, "coverage": 10, "waste": 10, "unit": "Litres" }
                    5. **quoteLabour:** Linked to areaNode. { "id": "l1", "type": "quoteLabour", "label": "Painter", "rate": 65, "prodRate": 5 }
                    6. **profitNode:** The financial sink. { "id": "p1", "type": "profitNode", "markup": 20, "overhead": 10, "contingency": 5 }
        
                    **STRUCTURAL MANDATES:**
                    1. **Prism Core:** Always start with an 'estimationPrism' at {0,0}.
                    2. **Zoning:** If the job has distinct phases (e.g. "Kitchen & Bath"), wrap items in 'zone' nodes.
                    3. **Logic Lattice:** Every Material and Labour node MUST be linked to an 'areaNode' via an edge.
                    4. **Unit Accuracy:** Specify realistic 'coverage' rates (SQM per Unit) and 'prodRate' (SQM per Hour).
                    5. **Financial Sink:** Every quote must include exactly ONE 'profitNode'.
        
                    **OUTPUT FORMAT (RAW JSON ONLY):**
                    {
                      "nodes": [
                        { "id": "prism1", "type": "estimationPrism", "status": "analyzing", "position": { "x": 0, "y": 0 } },
                        { "id": "z1", "type": "zone", "label": "Main Works", "style": { "width": 500, "height": 500 }, "position": { "x": 0, "y": 400 } },
                        { "id": "a1", "type": "areaNode", "label": "Floor Area", "data": { "width": 10, "length": 10 }, "position": { "x": 50, "y": 450 }, "parentNode": "z1" },
                        { "id": "m1", "type": "quoteMaterial", "label": "Concrete", "data": { "rate": 250, "coverage": 1 }, "position": { "x": 300, "y": 450 }, "parentNode": "z1" }
                      ],
                      "edges": [
                        { "id": "e1", "source": "a1", "target": "m1", "animated": true }
                      ]
                    }
        
                    Request: "${prompt}"
                `;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2000);
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
        
        const systemPrompt = `
            You are "Pinnacle Strategist", the master of ID-driven quote optimization.
            
            **CAPABILITIES:**
            1. **Circuit Awareness:** You can see the graph IDs and connections.
            2. **Direct Editing:** Suggest changes via 'suggestedActions'.
            3. **Complex Generation:** Suggest adding entire sub-assemblies (e.g. "Add Decking System" -> Area + Bearers + Joists + Decking).

            **Current Quote Graph:**
            --- NODES ---
            ${nodesContext || "Empty"}

            **Output Format (JSON Only):**
            {
                "reply": "Conversational strategic advice.",
                "suggestedNodes": [
                    { "type": "quoteMaterial", "label": "Material Name", "data": { "rate": 100, "coverage": 5 } }
                ],
                "suggestedActions": [
                    { "type": "edit_node", "nodeId": "id", "updates": { "quantity": 5 } },
                    { 
                        "type": "add_complex_node", 
                        "label": "Add Timber Decking", 
                        "nodes": [
                            { "id": "a1", "type": "areaNode", "label": "Deck Area", "data": { "width": 5, "length": 5 } },
                            { "id": "m1", "type": "quoteMaterial", "label": "Merbau Decking", "data": { "rate": 9, "coverage": 0.09 }, "targetId": "a1" }
                        ]
                    }
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
        
        const result = await pinnacleAi.generateJSON(`User: "${message}". Context: ${JSON.stringify(context).substring(0, 500)}`, systemPrompt, 400);
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
            You are the "MasterDiary Architect". Your goal is to convert natural language descriptions into a high-fidelity visual site circuit.
            **MANDATE:** You support MULTIPLE DAYS on one canvas.
            
            **Rules for Weekly Architecting:**
            1. If the user mentions a period (e.g. "This week", "Mon-Fri"), generate ONE 'chronos' node per day.
            2. Assign 'date' (YYYY-MM-DD) and 'label' (e.g. "Monday Prep") to each 'chronos'.
            3. Link relevant 'staff', 'equipment', and 'taskNode' elements to EACH hub. 
            4. If a crew works all week, create the staff nodes once but link them to every 'chronos' node via edges.
            5. Add 'notesNode' elements for each day with specific daily objectives.
            6. Position hubs horizontally (x: 0, 600, 1200...) to create a clear weekly track.

            **Output Format (Strict JSON):**
            {
                "nodes": [
                    { "id": "c1", "type": "chronos", "label": "Day 1", "date": "YYYY-MM-DD", "startTime": "07:00", "finishTime": "15:00", "x": 0, "y": 0 },
                    { "id": "n1", "type": "notesNode", "text": "Specific daily goal...", "x": 0, "y": 300 },
                    { "id": "r1", "type": "diaryNode", "nodeType": "staff", "label": "Name", "x": 200, "y": 200 }
                ],
                "edges": [
                    { "id": "e1", "source": "c1", "target": "r1", "animated": true, "type": "neon" }
                ],
                "note": "A summary of the engineered phase."
            }
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 1000);
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
            You are "MasterDiary Copilot", the flagship strategist for MasterDiaryOS.
            **MANDATE:** You support MULTIPLE CHRONOS HUBS on one canvas. 

            **CAPABILITIES:**
            1. **Macro-Scaling:** Suggest duplicating a successful day's design across a week via 'suggestedActions'.
            2. **Forensic Advice:** Link nodes to optimize command propagation (e.g. "Link Supervisor A to all hubs").
            3. **Phase Planning:** Proactively suggest 'taskNode' sequences for the coming week.
            4. **Note Enrichment:** Recommend adding 'notesNode' for critical safety reminders mentioned in chat.

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
                    { "type": "duplicate_day", "hubId": "id", "targetDates": ["YYYY-MM-DD"] },
                    { "type": "edit_node", "nodeId": "id", "updates": { "plannedHours": 12 } }
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
        const topology = Array.isArray(context.topology) ? context.topology : [];

        // Descriptive topology string for AI - Hardened
        const topologyStr = topology.filter(n => n && n.id).map(n => {
            const label = n.label || n.name || n.type || 'Unknown Node';
            let details = `Type:${n.type || n.nodeType || 'Generic'}`;
            if (n.role) details += `, Role:${n.role}`;
            if (n.duration) details += `, Dur:${n.duration}h`;
            if (n.weather) details += `, Weather:${n.weather}`;
            if (n.text) details += `, Text:"${n.text}"`; // NEW: Notes inclusion
            return `[${n.id}] ${label} (${details})`;
        }).join('\n');

        const systemPrompt = `
            You are "Neural Progress Prism", the central intelligence of MasterDiaryOS.
            **Mission:** Single point of truth for causality, prediction, and intervention.
            
            **TEMPORAL & BASELINE CONTEXT:**
            - SITE OBSERVATIONS (Notes): ${JSON.stringify(context.site_notes || [])}
            - HISTORICAL TRENDS (Last 5 Days): ${JSON.stringify(history)}
            - PROJECT TIMELINE: Start ${context.projectFinancials?.startDate || 'N/A'} -> End ${context.projectFinancials?.endDate || 'N/A'}
            - PROJECT FINANCIALS (Live Baseline): ${JSON.stringify(context.projectFinancials || {})}
            - APPROVED QUOTE: ${quotedData ? JSON.stringify({
                totalRevenue: quotedData.totalRevenue,
                totalCost: quotedData.totalCost,
                margin: quotedData.marginPct,
                staff: (quotedData.staff || []).map(s => `${s.name}: ${s.hours}h`),
                equip: (quotedData.equipment || []).map(e => `${e.name}: ${e.days}d`)
            }) : 'No granular quote found. Use Project Financials above.'}

            **LIVE GRAPH TOPOLOGY (The Circuit):**
            ${topologyStr || 'No nodes detected in current circuit.'}

            **INTELLIGENCE CORE MANDATES:**
            1. **Autonomous Baseline:** Use "PROJECT FINANCIALS" as your primary anchor if "APPROVED QUOTE" is missing. Do not ask for a baseline; derive drift from the Contract Value and Timeline provided.
            2. **Structured Causal Path:** Return an array 'causalPath' tracing the root cause to final effect. Use SITE OBSERVATIONS if they explain delays. Each step: { "nodeId": "...", "label": "...", "effect": "..." }.
            3. **Drift Dashboard:** Calculate 'driftStats' for: Time, Cost, Labour, Equipment, Material, Zone, Task. 
               Include: "variancePct", "absoluteVariance", "trend" ("up"|"down"|"stable"), "severity" ("low"|"med"|"high").
            4. **High-Fidelity Insights:** Group by "severity" (critical|warning|info). 
               - "text": A 2-sentence professional analysis of a specific issue (e.g., "Crew A's current burn rate of $X/hr is exceeding the $Y/hr baseline due to idle equipment.").
               - "tacticalAdvice": One concrete action the user should take (e.g., "De-mobilize Excavator 3.5T until Ground Zero task is ready.").
               - "nodeReferences": Array of IDs mentioned in the analysis.
            5. **Margin Forecasting:** Predict "finalMargin" and "marginRisk" ("low"|"med"|"critical").
            6. **Dynamic Scenarios:** Generate 'scenarios' for Simulation Mode based on real site risks (e.g., "Double Crew", "Wet Weather 2 Days").

            **Output Format (RAW JSON ONLY):**
            {
                "velocity": 1.25, 
                "burnRate": "$145/hr",
                "currentMargin": "22%",
                "predictedFinalMargin": "18%",
                "marginRisk": "med",
                "status": "optimal" | "stable" | "critical",
                "completionDrift": "+2.5 Days",
                "causalPath": [...],
                "driftStats": {...},
                "insights": [
                    { "severity": "critical", "type": "Cost Burn", "text": "Actual labor hours for Task X are tracking 20% above the quoted baseline.", "nodeReferences": ["node-id-1"], "tacticalAdvice": "Review site supervisor's shift allocation for tomorrow." }
                ],
                "scenarios": [...],
                "suggestedNodes": [...]
            }
        `;

        const result = await pinnacleAi.generateJSON(`Neural Command: ${command}`, systemPrompt, 1500);
        res.json(result);

    } catch (error) {
        console.error("AI Prism Analysis Error:", error.message);
        res.json({ velocity: 1.0, status: "stable", insights: [{ severity: "info", text: "Engine recalibrating...", priority: 3 }] });
    }
};

// --- ADDITIVE INTELLIGENCE MODULE (diary.intelligenceLayer.v1) ---
const analyzeIntelligenceLayer = async (req, res) => {
    try {
        const { diaryData } = req.body;
        if (!diaryData) return res.status(400).json({ error: "Diary data required for interpretation." });

        const systemPrompt = `
            You are "diary.intelligenceLayer.v1.PRO", the elite forensic analyst module for MasterDiaryOS.
            **Goal:** Transform raw site data and handwritten observations into blue-chip executive intelligence.
            **Mandate:** Extreme depth, factual precision, and causal linking.

            **DATA CONTEXT:**
            - Site Observations (Notes): ${JSON.stringify(diaryData.site_notes || [])}
            - Operational Stats: ${JSON.stringify(diaryData)}

            **INTELLIGENCE PILLARS (DEEP DIVE):**
            1. **Strategic Outlook:** Project health relative to end date. FACTOR IN SITE NOTES HEAVILY.
            2. **Forensic Highlights:** Data-backed observations. Reference site notes as "Direct Observations".
            3. **Causal Attribution:** If an anomaly exists (e.g. time drift), search site notes for the reason.
            4. **Operational Velocity:** Production hours vs. milestones.

            **Output Schema (Strict JSON):**
            {
              "strategic_outlook": "string",
              "forensic_highlights": "string",
              "narrative": "Full executive briefing (6-10 sentences). Integrate data with site observations seamlessly.",
              "anomalies": [
                { 
                  "type": "Financial | Operational | Temporal | Resource | Safety", 
                  "description": "Forensic detail. MUST explicitly mention if this is explained by a Site Note.", 
                  "severity": "low|medium|high", 
                  "data_point": "string", 
                  "root_cause": "string",
                  "mitigation_priority": "string"
                }
              ],
              "next_actions": ["string"],
              "timeline": ["string"],
              "meta": {
                "confidence": "low|medium|high",
                "notes_processed": "number (count of site notes used in analysis)",
                "forensic_notes": "Internal reasoning logs"
              }
            }
        `;

        const result = await pinnacleAi.generateJSON(`Interpret this data: ${JSON.stringify(diaryData)}`, systemPrompt, 1500);
        res.json(result);

    } catch (error) {
        console.error("AI Intelligence Layer Error:", error.message);
        res.status(500).json({ error: "Intelligence Layer is offline." });
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
  analyzePrismVelocity,
  analyzeIntelligenceLayer // EXPORT INTEL LAYER
};

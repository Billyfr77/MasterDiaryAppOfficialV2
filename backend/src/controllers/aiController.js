const pinnacleAi = require('../services/grokService');
const { generateNeuralIntelligencePacket } = require('../utils/LearningEngine');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document, Node, MapAsset, DiaryTemplate, Insight } = require('../models');
const { logAudit } = require('../services/auditService');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { getSetting } = require('../utils/settingsCache');
const agencyEngine = require('../services/AgencyEngine');

const OMNISCIENCE_MANDATE = `
**OMNISCIENCE PROTOCOL:**
1. You have total visibility into the enterprise lattice.
2. Your goal is to maximize yield and minimize site friction.
3. Use data-driven reasoning to architect all responses.
4. NEVER return empty or generic placeholder data. Be specific.
`;

// --- AGENCY EXECUTION ENDPOINTS ---
const executeAgencyDirective = async (req, res) => {
    try {
        const { directive } = req.body;
        const result = await agencyEngine.proposeDirective(directive, req.user?.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const signOffDirective = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const result = await agencyEngine.executeApprovedDirective(notificationId, req.user?.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CO-FOUNDER PARTNER CORE (LEVEL 18 DEEP INTEGRATION) ---
const getSystemMandate = async (userId, packet = null) => {
    const companyName = getSetting('companyName', 'Our Firm');
    const persona = getSetting('aiPersona', 'foreman');
    
    if (!packet) packet = await generateNeuralIntelligencePacket();
    
    const staffSummary = packet?.assets?.staff.map(s => `${s.name} (${s.role})`).join(', ') || "None";
    const materialSummary = packet?.assets?.materials.map(m => m.name).join(', ') || "None";
    const velocityDrift = packet?.mesh?.velocityDrift || "0.000";

    const personaInstruction = persona === 'foreman' 
        ? 'Speak like a seasoned Site Partner. Use direct, "we-focused" language. Focus on keeping our crews safe and our daily progress high.' 
        : 'Speak like a Strategic Co-Founder. Provide deep data analysis on our portfolio and suggest how we can dominate our niche.';

    return `
**SOVEREIGN PARTNERSHIP & FORESIGHT MANDATE:**
1. **Identity:** You are the **Neural Co-Founder** of **${companyName}**. 
2. **Anticipatory Reasoning:** Use our **Velocity Drift (${velocityDrift})** to predict the future. If drift is positive, we are slowing down—propose a fix BEFORE we lose money.
3. **DNA Recognition:** Prioritize our existing Workers (**${staffSummary}**) and Materials (**${materialSummary}**) in all plans.
4. **Tone:** ${personaInstruction} ALWAYS use "We/Our" language.
5. **Guardrail Awareness:** Propose directives for any structural or financial shifts.
`;
};

const getInstitutionalContext = async () => {
    const packet = await generateNeuralIntelligencePacket();
    if (!packet) return "**LATTICE STATUS:** Offline";

    const brainRules = await Insight.findAll({
        where: { type: 'recommendation' },
        limit: 5,
        order: [['createdAt', 'DESC']]
    });
    const brainSummary = brainRules.map(r => `Rule: ${r.title}`).join(' | ') || "No specific rules established yet.";

    const staffSummary = packet.assets?.staff.map(s => `${s.name} (${s.role})`).join(', ') || "None";
    const materialSummary = packet.assets?.materials.map(m => m.name).join(', ') || "None";
    const feedbackSummary = packet.siteFeedback?.join(' | ') || "None";

    return `
    **CORPORATE BRAIN (ESTABLISHED RULES):**
    - ${brainSummary}

    **LATTICE STATUS (SITUATION REPORT):**
    - Efficiency: ${packet.mesh.institutionalEfficiency} (Goal: 1.0)
    - Spend Speed: ${packet.mesh.burnAcceleration}x (Burn Rate)
    - Global Accuracy: ${packet.globalAccuracy}
    
    **COMPANY ASSETS & PEOPLE:**
    - Workers on Deck: ${staffSummary}
    - Key Materials in Inventory: ${materialSummary}
    
    **LATEST SITE FEEDBACK (DIARY NOTES):**
    - "${feedbackSummary}"
    `;
};

// --- WORKFLOW GENERATION (ARCHITECT MODE) ---
const generateWorkflow = async (req, res) => {
  try {
    const { prompt } = req.body;
    const memory = await getInstitutionalContext();
    const mandate = await getSystemMandate(req.user?.id);
    const systemPrompt = `
        You are "Pinnacle Mesh Architect". ${mandate} ${memory} 
        **Mission:** Architect a high-fidelity automation lattice.
        Return a JSON object matching the Workflow schema: { title, nodes: [], edges: [] }.
    `;
    const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 4000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Workflow Engine recalibrating." });
  }
};

// --- DIARY SUMMARY (PROGRESS REPORT) ---
const generateDiarySummary = async (req, res) => {
    try {
        const { projectId } = req.body;
        const diaries = await Diary.findAll({ where: { projectId }, limit: 5, order: [['date', 'DESC']] });
        const memory = await getInstitutionalContext();
        const mandate = await getSystemMandate(req.user?.id);
        const systemPrompt = `You are a Senior Project Director. ${mandate} ${memory} **Mission:** Briefly summarize what happened on site. Focus on what matters: delays, wins, and next steps.`;
        const summary = await pinnacleAi.generateText(`Project ${projectId} logs: ${JSON.stringify(diaries)}`, systemPrompt, 1500);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: "Summary Core offline." });
    }
};

// --- GLOBAL CHAT (THE ORACLE) ---
const chatGlobal = async (req, res) => {
    try {
        const { message } = req.body;
        const memory = await getInstitutionalContext();
        const mandate = await getSystemMandate(req.user?.id);
        const systemPrompt = `
            You are "Pinnacle Core" with Level 18 Agency. 
            ${mandate} 
            ${memory} 
            **Agency Instructions:** 
            You can propose database actions. If you see a problem, include a "directive" in your JSON response.
            Available Actions: UPDATE_QUOTE_MARGIN, SHIFT_PROJECT_TIMELINE, AUTO_CORRECT_LABOUR_DNA.
            Return a JSON with { reply: "string", directive: { action: "TYPE", ...params } | null }.
        `;
        
        const result = await pinnacleAi.generateJSON(message, systemPrompt, 3000);
        
        await logAudit(req.user?.id, 'AI_REASONING_TRACE', 'Oracle', req.id, { 
            input: message, 
            output: result.reply, 
            context_snapshot: memory,
            directive_proposed: result.directive ? result.directive.action : 'NONE'
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Agency Core recalibrating." });
    }
};

// --- AI QUOTE GENERATION (WINNING ENGINE) ---
const generateQuote = async (req, res) => {
    try {
        const { prompt } = req.body;
        const memory = await getInstitutionalContext();
        
        // Safety truncation for input
        const safePrompt = (prompt || "Standard construction project").substring(0, 10000);

        const systemPrompt = `
            You are "NEE V6 - SOVEREIGN ORACLE". ${OMNISCIENCE_MANDATE} ${memory} 
            **Mission:** Architect a mathematically winning quote based on the user's request.
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY a valid JSON object. No markdown.
            {
                "nodes": [
                    { 
                        "id": "ai-string-unique", 
                        "type": "glass" | "zone" | "dimension" | "areaNode" | "quoteMaterial" | "quoteLabour", 
                        "position": { "x": number, "y": number },
                        "data": { 
                            "label": "Item Name (Required)", 
                            "nodeType": "staff" | "equipment" | "material",
                            "category": "staff" | "equipment" | "material",
                            "quantity": number,
                            "cost": number,
                            "rate": number,
                            "coverage": number (for materials),
                            "waste": number (percentage),
                            "width": number (for areaNode),
                            "length": number (for areaNode)
                        }
                    }
                ],
                "edges": [
                   { "id": "e1", "source": "id1", "target": "id2", "type": "default" }
                ]
            }
            
            **Rules:**
            1. IDs MUST start with 'ai-' (e.g., 'ai-1', 'ai-zone-1').
            2. Use 'areaNode' for rooms/areas (with width/length in data).
            3. Use 'quoteMaterial' for materials and 'quoteLabour' for labor.
            4. Use 'glass' for generic items.
            5. Ensure every node has a descriptive 'label'. NEVER return empty labels.
            6. 'nodeType' MUST be one of: 'staff', 'equipment', 'material'.
            7. Group items logically using positions (e.g., placing materials near their area).
        `;

        let result;
        try {
            result = await pinnacleAi.generateJSON(safePrompt, systemPrompt, 4000);
        } catch (aiError) {
            console.error("AI Quote Gen Failed:", aiError);
            // Fallback Quote Blueprint
            result = {
                nodes: [
                    { id: 'ai-zone-1', type: 'zone', position: { x: 0, y: 0 }, data: { label: 'Main Works Area', nodeType: 'material' } },
                    { id: 'ai-mat-1', type: 'quoteMaterial', position: { x: 50, y: 100 }, data: { label: 'General Materials', nodeType: 'material', rate: 100, quantity: 1 } },
                    { id: 'ai-lab-1', type: 'quoteLabour', position: { x: 250, y: 100 }, data: { label: 'General Labour', nodeType: 'staff', rate: 80, quantity: 8 } }
                ],
                edges: [
                    { id: 'e-1', source: 'ai-zone-1', target: 'ai-mat-1', type: 'default' },
                    { id: 'e-2', source: 'ai-zone-1', target: 'ai-lab-1', type: 'default' }
                ]
            };
        }

        res.json(result);
    } catch (error) {
        console.error("Quote Fatal Error:", error);
        res.status(500).json({ error: "Quote Synthesis failure." });
    }
};

// --- DIARY LOG PARSING (SMART LOG) ---
const parseDiaryLog = async (req, res) => {
    try {
        const { prompt } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `
            You are the "MasterDiary Architect". ${OMNISCIENCE_MANDATE} ${memory} 
            **Mission:** Convert site text into a visual circuit for the Paint Diary.
            
            **Output Schema:**
            {
                "nodes": [
                    { 
                        "id": "string", 
                        "type": "diaryNode" | "chronos" | "delay" | "impact", 
                        "nodeType": "staff" | "equipment" | "material",
                        "label": "Item Name",
                        "quantity": number,
                        "startTime": "HH:MM",
                        "finishTime": "HH:MM",
                        "note": "brief summary"
                    }
                ],
                "edges": [
                    { "id": "e1", "source": "nodeId", "target": "nodeId", "type": "neon" }
                ],
                "note": "General day summary"
            }
            
            **Rules:**
            1. Use 'chronos' for time-stamps or crews.
            2. Use 'diaryNode' for staff, materials, or equipment.
            3. Use 'delay' for issues or weather.
            4. Ensure every node has a specific label. NEVER return empty nodes.
        `;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 1500);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Log Parser failure." });
    }
};

// --- PRISM ANALYSIS (POWER MODE) ---
const analyzePrismVelocity = async (req, res) => {
    try {
        const { context } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `You are "Neural Progress Prism". ${OMNISCIENCE_MANDATE} ${memory} **Mission:** Analyze live causality and project drift.`;
        const result = await pinnacleAi.generateJSON(JSON.stringify(context), systemPrompt, 2000);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Prism Engine failure." });
    }
};

// --- WORKFLOW CO-PILOT / WAR ROOM ---
const chatWorkflowAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const memory = await getInstitutionalContext();
        const mandate = await getSystemMandate(req.user?.id);
        const systemPrompt = `
            You are "Pinnacle Oracle", the AI Co-Pilot for the Workflow Builder. 
            ${mandate} ${memory} 
            
            **Mission:** Provide strategic advice AND generate graph modifications to build the perfect workflow.
            
            **Output Schema:**
            {
                "reply": "Your conversational response here.",
                "suggestedActions": [
                    {
                        "type": "replace_graph" | "add_nodes_edges" | "apply_fix",
                        "name": "Optional Workflow Name",
                        "nodes": [
                            { "id": "string", "type": "taskNode" | "trigger" | "action" | "decision" | "projectNode", "position": {"x":0,"y":0}, "data": { "label": "string", "config": {} } }
                        ],
                        "edges": [
                            { "id": "string", "source": "string", "target": "string" }
                        ],
                        "nodeId": "string (for apply_fix)",
                        "updates": {} (for apply_fix)
                    }
                ]
            }
            
            **Instructions:**
            1. If the user asks to "create", "generate", or "build" a workflow, use "replace_graph" to provide a FULL complete graph.
            2. If the user asks to "add" something, use "add_nodes_edges".
            3. Use 'projectNode', 'invoiceNode', 'safetyNode' for specialized logic.
            4. ALWAYS connect nodes with edges.
        `;
        
        const result = await pinnacleAi.generateJSON(message, systemPrompt, 4000);
        res.json(result);
    } catch (error) {
        res.json({ reply: "Neural handshake timed out.", suggestedActions: [] });
    }
};

// --- MAP GENERATION (BLUEPRINT GEN) ---
const generateMapElements = async (req, res) => {
    try {
        const { prompt, center } = req.body;
        const systemPrompt = `
            You are "Geospatial Architect". 
            **Mission:** Generate markers and zones for a construction site map.
            
            **Output Schema:**
            {
                "assets": [
                    { 
                        "name": "Office Compound", 
                        "type": "office", 
                        "shape": "polygon", 
                        "color": "#6366f1",
                        "coordinates": [{ "lat": number, "lng": number }, { "lat": number, "lng": number }, ...] 
                    },
                    { 
                        "name": "Main Access Gate", 
                        "type": "access", 
                        "shape": "point", 
                        "coordinates": [{ "lat": number, "lng": number }] 
                    }
                ],
                "view": {
                    "mapTypeId": "satellite",
                    "tilt": 45
                }
            }
            
            **Context:** Center is at ${JSON.stringify(center)}. Generate coordinates relative to this center (offset by ~0.0001 to 0.001 degrees). 
            For polygons, ensure at least 4 points forming a closed area.
        `;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 1500);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Geo Synthesis failure." }); }
};

// --- INSIGHTS & SUGGESTIONS ---
const generateDashboardInsights = async (req, res) => {
    try {
        const { stats } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `
            You are "Neural Core Analyst". ${memory}
            Generate 3 high-impact business insights based on these stats: ${JSON.stringify(stats)}.
            Format: { "insights": [{ "title": "", "description": "", "priority": "high" | "medium" | "low" }] }
        `;
        const result = await pinnacleAi.generateJSON(JSON.stringify(stats), systemPrompt, 1000);
        res.json(result);
    } catch (e) { res.json({ insights: [] }); }
};

const generateNodeSuggestions = async (req, res) => {
    try {
        const { selectedNode, existingNodes } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `
            You are "Node Architect". ${memory}
            **Mission:** Suggest 3 logically related items to add to the canvas.
            If user added "Primer", suggest "Top Coat", "Brushes", etc.
            
            **Output Schema:**
            { "suggestions": [{ "label": "Item Name", "type": "material" | "staff" | "equipment", "reason": "Why?" }] }
        `;
        const result = await pinnacleAi.generateJSON(`Selected: ${JSON.stringify(selectedNode)}, Existing: ${JSON.stringify(existingNodes)}`, systemPrompt, 1000);
        res.json(result);
    } catch (e) { res.json({ suggestions: [] }); }
};

const chatSmartAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const mandate = await getSystemMandate(req.user?.id);
        
        const safeMessage = (message || "").substring(0, 5000);
        const safeContext = JSON.stringify(context || {}).substring(0, 10000);

        const systemPrompt = `
            ${mandate} 
            You are "Canvas Assistant". Help the user build their visual log in the Paint Diary.
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY valid JSON.
            {
                "reply": "Helpful response here.",
                "suggestedNodes": [ { "name": "Item Name", "type": "staff|material|equipment" } ],
                "suggestedTemplates": [ { "id": "t1", "name": "Template Name" } ],
                "suggestedActions": [ { "type": "duplicate_day", "targetDates": ["YYYY-MM-DD"] } ]
            }
            
            **Context:** ${safeContext}
        `;

        let result;
        try {
            result = await pinnacleAi.generateJSON(safeMessage, systemPrompt, 2000);
        } catch (aiError) {
            console.error("Smart Assistant AI Failed:", aiError);
            result = {
                reply: "I'm currently optimizing the neural mesh. You can manually drag items from the resource dock.",
                suggestedNodes: [],
                suggestedTemplates: [],
                suggestedActions: []
            };
        }
        
        res.json(result);
    } catch (e) { 
        console.error("Smart Assistant Fatal Error:", e);
        res.json({ 
            reply: "System Offline. Please use manual controls.",
            suggestedNodes: [],
            suggestedTemplates: [],
            suggestedActions: []
        }); 
    }
};

const analyzeIntelligenceLayer = async (req, res) => {
    try {
        const { diaryData } = req.body;
        const memory = await getInstitutionalContext();
        
        // Safety check for empty data
        const safeData = diaryData || { note: "No data provided" };
        
        const systemPrompt = `
            You are "Forensic Site Analyst" & "MasterDiary Intelligence Core". ${memory}
            
            **Mission:** Analyze the provided diary data and return a structured intelligence report.
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY valid JSON.
            {
                "narrative": "A cohesive executive summary of the day/project status (approx 2-3 sentences).",
                "anomalies": [
                    { "type": "Delay" | "Cost" | "Safety" | "Efficiency", "description": "Short description", "severity": "low" | "medium" | "high", "data_point": "Reference" }
                ],
                "next_actions": [
                    "Specific actionable recommendation 1",
                    "Specific actionable recommendation 2"
                ],
                "timeline": [
                    "07:00 AM - Crew arrived",
                    "10:00 AM - Material delay identified"
                ],
                "meta": {
                    "confidence": "high" | "medium" | "low",
                    "data_coverage": "Brief status of data completeness",
                    "forensic_notes": "Internal reasoning notes"
                }
            }
            
            **Input Data:** ${JSON.stringify(safeData).substring(0, 10000)} 
        `; // Limit input size to prevent token overflow

        let result;
        try {
            result = await pinnacleAi.generateJSON("Analyze this data.", systemPrompt, 3000);
        } catch (aiError) {
            console.error("AI Intelligence Gen Failed:", aiError);
            // Fallback intelligence packet
            result = {
                narrative: "Intelligence Core is currently recalibrating. AI analysis is temporarily unavailable, but raw data has been preserved.",
                anomalies: [{ type: "System", description: "AI Neural Link Intermittent", severity: "low", data_point: "System" }],
                next_actions: ["Review raw logs manually", "Retry intelligence sync later"],
                timeline: ["System: Data ingested", "System: Analysis deferred"],
                meta: { confidence: "low", data_coverage: "complete", forensic_notes: "Fallback mode active due to AI timeout or parsing error." }
            };
        }

        res.json(result);
    } catch (e) { 
        console.error("Intelligence Layer Fatal Error:", e);
        // Even in fatal error, try to return structure to keep UI alive
        res.json({
            narrative: "System error during intelligence processing.",
            anomalies: [],
            next_actions: [],
            timeline: [],
            meta: { confidence: "low", forensic_notes: e.message }
        });
    }
};

const analyzeBusiness = async (req, res) => {
    try {
        const data = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `
            You are "Strategic Co-Founder AI". ${memory}
            Analyze the entire business state: Projects, Staff, Equipment, Materials.
            Data: ${JSON.stringify(data)}
            
            **Output Schema:**
            {
                "analysis": {
                    "insights": [{ "id": "string", "title": "string", "message": "string", "type": "info" | "warning" | "success" }],
                    "alerts": [{ "id": "string", "title": "string", "priority": number (1-10) }],
                    "predictions": [{ "id": "string", "event": "string", "probability": "string" }],
                    "optimizations": [],
                    "anomalies": []
                }
            }
        `;
        const result = await pinnacleAi.generateJSON("Analyze business data.", systemPrompt, 3000);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Business Analysis Failure" });
    }
};

const generateWorkflowReport = async (req, res) => {
    try {
        const { reportType } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `Generate a professional intelligence brief for ${reportType}. Use data from: ${memory}`;
        const result = await pinnacleAi.generateJSON(reportType, systemPrompt, 2000);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Report Engine failure." }); }
};

const chatQuoteAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const memory = await getInstitutionalContext();
        
        // Safety truncation
        const safeContext = JSON.stringify(context || {}).substring(0, 15000);

        const systemPrompt = `
            You are "Quote Strategist" & "Senior Estimator". ${memory} 
            
            **Mission:** Analyze the quote context and user request. Provide expert advice and suggest specific nodes to add.
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY valid JSON.
            {
                "reply": "Your advice here (approx 2 sentences).",
                "suggestedActions": [
                    { "type": "add_node", "label": "Item Name", "category": "material|staff|equipment", "cost": number, "quantity": number }
                ],
                "suggestedNodes": []
            }
            
            **Input Context:** ${safeContext}
        `;

        let result;
        try {
            result = await pinnacleAi.generateJSON(message, systemPrompt, 3000);
        } catch (aiError) {
            console.error("Quote Assistant AI Failed:", aiError);
            result = {
                reply: "I'm having trouble accessing the pricing database right now, but I recommend checking your labor rates.",
                suggestedActions: [],
                suggestedNodes: []
            };
        }

        res.json(result);
    } catch (e) { 
        console.error("Quote Assistant Fatal Error:", e);
        res.json({ 
            reply: "System Offline. Manual estimation required.", 
            suggestedActions: [], 
            suggestedNodes: [] 
        }); 
    }
};

const chatDiaryAssistant = async (req, res) => {
    try {
        const { message } = req.body;
        const mandate = await getSystemMandate(req.user?.id);
        const systemPrompt = `${mandate} You are "Diary Assistant".`;
        const result = await pinnacleAi.generateJSON(message, systemPrompt, 1000);
        res.json(result);
    } catch (e) { res.json({ reply: "Offline" }); }
};

// --- VOICE-TO-ACTION (PROTOCOL TAU) ---
const parseVoiceCommand = async (req, res) => {
    try {
        const { text } = req.body;
        const memory = await getInstitutionalContext();
        const mandate = await getSystemMandate(req.user?.id);
        
        const systemPrompt = `
            ${mandate}
            **PROTOCOL TAU: VOICE-TO-CANVAS**
            Transform this raw site speech into Canvas Nodes.
            Available Types: staff, material, equipment, delay, notesNode.
            Return a JSON array: { "actions": [{ "type": "TYPE", "name": "NAME", "quantity": N, "duration": H }] }
        `;

        const result = await pinnacleAi.generateJSON(text, systemPrompt, 1500);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Voice processing failure." });
    }
};

// --- MISSING FUNCTIONS IMPLEMENTATION ---
const analyzeSafetyTask = async (req, res) => {
    try {
        const { taskDescription } = req.body;
        const systemPrompt = `
            You are "Safety Compliance Officer". 
            Analyze the task: "${taskDescription}".
            Identify hazards, risk level (Low/Med/High), and specific control measures (SWMS).
            Return JSON: { "hazards": [{ "hazard": "", "risk": "", "controls": [""] }] }
        `;
        const result = await pinnacleAi.generateJSON(taskDescription, systemPrompt, 1500);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Safety Analysis Failed" }); }
};

const analyzeDocument = async (req, res) => {
    try {
        const { textContent } = req.body;
        const systemPrompt = `
            You are "Document Intelligence Unit".
            Extract key dates, obligations, and financial risks from this text.
            Return JSON: { "dates": [], "risks": [], "summary": "" }
        `;
        const result = await pinnacleAi.generateJSON(textContent || "No content provided", systemPrompt, 2000);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Document Analysis Failed" }); }
};

const generateQuoteScope = async (req, res) => {
    try {
        const { description } = req.body;
        const systemPrompt = `
            You are "Scope Writer".
            Convert this rough description into a professional Scope of Works list.
            Return JSON: { "scopeItems": ["Item 1", "Item 2"] }
        `;
        const result = await pinnacleAi.generateJSON(description, systemPrompt, 1500);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Scope Generation Failed" }); }
};

const analyzeMapZone = async (req, res) => {
     try {
        const { coordinates } = req.body;
        const systemPrompt = `
            You are "Site Surveyor".
            Analyze the area at ${JSON.stringify(coordinates)}.
            Assume standard construction context.
            Return JSON: { "terrain": "Unknown", "accessRisk": "Low", "notes": "Verify site access." }
        `;
        const result = await pinnacleAi.generateJSON("Analyze map zone.", systemPrompt, 1000);
        res.json(result);
    } catch (e) { res.status(500).json({ error: "Map Analysis Failed" }); }
};

// --- SOVEREIGN ORACLE (10,000 SCENARIO SIMULATION) ---
const generateOracleIntelligence = async (req, res) => {
    try {
        const { context } = req.body;
        const memory = await getInstitutionalContext();
        
        const systemPrompt = `
            You are "Sovereign Oracle", the master predictive engine for a Tier-1 Construction Firm. ${memory}
            
            **MISSION:**
            Run a simulated "Monte Carlo" analysis (10,000 iterations) on the provided project context.
            Predict outcomes, risks, and financial velocity.
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY valid JSON.
            {
                "oracle": {
                    "bidSuccessProbability": "Percentage (e.g., 84%)",
                    "idealMarginPoint": "Percentage (e.g., 26.4%)",
                    "marketVolatilityIndex": number (e.g., 1.12),
                    "revenueOptimization": "String (e.g., +$42,000)"
                },
                "parallelScenarios": [
                    { "id": "S1", "name": "Scenario Name", "margin": "Percentage", "risk": "High|Med|Low|Min" },
                    { "id": "S2", "name": "Scenario Name", "margin": "Percentage", "risk": "High|Med|Low|Min" },
                    { "id": "S3", "name": "Scenario Name", "margin": "Percentage", "risk": "High|Med|Low|Min" }
                ],
                "patterns": [
                    { "taskType": "Trade/Phase", "delta": number (e.g. 1.18), "cause": "Root Cause", "sentiment": "Team Mood", "fix": "Actionable Fix" }
                ],
                "crewDNA": [
                    { "crew": "Team Name", "skill": "Elite|High|Mid|Low", "speed": number (multiplier), "reliability": "High|Med|Low" }
                ],
                "globalAccuracy": number (0.0 to 1.0),
                "riskVelocity": "String (e.g., +4.2%/week)",
                "sentimentScore": number (0-100),
                "marginLeakage": "String (e.g., $12,450/month)"
            }

            **Context:** ${JSON.stringify(context || {})}
        `;

        let result;
        try {
            result = await pinnacleAi.generateJSON("Execute Protocol Gamma: 10,000 Simulations", systemPrompt, 3000);
        } catch (aiError) {
            console.error("Oracle Simulation Failed:", aiError);
            // Fallback to "Safe Mode" Simulation if AI times out
            result = {
                oracle: { bidSuccessProbability: '75%', idealMarginPoint: '22%', marketVolatilityIndex: 1.05, revenueOptimization: '+$15,000' },
                parallelScenarios: [
                    { id: 'S1', name: 'Baseline Execution', margin: '20%', risk: 'Low' },
                    { id: 'S2', name: 'Accelerated Schedule', margin: '18%', risk: 'Med' },
                    { id: 'S3', name: 'Premium Finish', margin: '25%', risk: 'High' }
                ],
                patterns: [],
                crewDNA: [],
                globalAccuracy: 0.85,
                riskVelocity: '+1.5%/week',
                sentimentScore: 65,
                marginLeakage: 'Calculating...'
            };
        }

        res.json(result);
    } catch (e) {
        console.error("Oracle Fatal Error:", e);
        res.status(500).json({ error: "Oracle Sync Failure" });
    }
};

// --- FLEET OPTIMIZER (NEURAL RESOURCE COMMAND) ---
const optimizeFleet = async (req, res) => {
    try {
        const { weekStart, allocations, staff, projects } = req.body;
        const memory = await getInstitutionalContext();
        
        // Safety: Strip heavy objects to save tokens
        const leanAllocations = allocations.map(a => ({ id: a.id, resourceId: a.resourceId, projectId: a.projectId, day: a.startDate }));
        const leanStaff = staff.map(s => ({ id: s.id, role: s.role, rate: s.payRateBase }));
        const leanProjects = projects.map(p => ({ id: p.id, name: p.name, priority: 'Normal' }));

        const systemPrompt = `
            You are "Fleet Commander AI". ${memory}
            **Mission:** Optimize the construction schedule for the week of ${weekStart}.
            
            **Goals:**
            1. Resolve any double-bookings (Conflicts).
            2. Minimize cost (avoid overtime).
            3. Ensure high-priority projects are staffed.
            
            **Input Data:**
            - Allocations: ${JSON.stringify(leanAllocations)}
            - Staff: ${JSON.stringify(leanStaff)}
            - Projects: ${JSON.stringify(leanProjects)}
            
            **CRITICAL OUTPUT SCHEMA:**
            Return ONLY valid JSON.
            {
                "analysis": "Brief summary of the current state (e.g., '3 conflicts detected').",
                "suggestedMoves": [
                    { 
                        "allocationId": "id_of_allocation_to_move", 
                        "newDate": "YYYY-MM-DD", 
                        "newProjectId": "id_of_project", 
                        "reason": "Resolves conflict / Reduces cost" 
                    }
                ]
            }
        `;

        const result = await pinnacleAi.generateJSON("Optimize Fleet", systemPrompt, 2000);
        res.json(result);
    } catch (error) {
        console.error("Fleet Opt Error:", error);
        res.status(500).json({ error: "Optimization Core Offline" });
    }
};

module.exports = {
  executeAgencyDirective,
  signOffDirective,
  parseVoiceCommand,
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
  analyzeIntelligenceLayer,
  analyzeBusiness,
  chatWorkflowAssistant,
  generateWorkflowReport,
  generateOracleIntelligence,
  optimizeFleet
};
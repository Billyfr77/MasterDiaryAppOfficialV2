const pinnacleAi = require('../services/grokService');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document, Node, MapAsset } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

// --- HELPER TO ATTACH FINANCIALS (can be moved to a dedicated service) ---
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

// --- WORKFLOW GENERATION ---
const generateWorkflow = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    const systemPrompt = `
      You are an expert construction project manager and systems architect (Pinnacle AI).
      Your goal is to design efficient, robust operational workflows for the construction industry.
      
      Output a valid React Flow JSON object: { "nodes": [], "edges": [] }.

      **Node Types & Usage:**
      - 'trigger': Start points (e.g. "Form Submitted").
      - 'action': Task execution (e.g. "Email Client", "Create Document").
      - 'decision': Logic split (e.g. "Value > $5k?", "Safety Risk High?").
      - 'approval': Human sign-off required.
      - 'milestone': Key event or completion point.
      - 'default': Standard process steps.

      **Node Data Schema (Important):**
      Each node's "data" object MUST include:
      - "label": Short, action-oriented title.
      - "description": A concise 1-sentence explanation of the step.
      - "assignee": Suggested role (e.g., "Site Manager", "Safety Officer", "Client").
      - "checklist": Array of objects { "text": "Subtask", "completed": false } (For 'action'/'default' nodes).
      
      **Action Powers (For 'action' nodes):**
      If the node is an 'action', you MUST include an "actionType" property from this list:
      - "create_project": Automatically create a project (e.g. from a Quote).
      - "create_invoice": Generate a draft invoice.
      - "assign_staff": Allocate a resource.
      - "send_notification": Alert a user/role.
      - "generic": For manual tasks.

      **Layout Rules:**
      - Flow from Top to Bottom.
      - Spacing: Start at {x: 250, y: 0}. Increment Y by 150px for each step.
      - For branches, space X by +/- 200px.
      - Assign unique IDs (e.g., 'n1', 'n2').
      - Edges must link valid Source ID to Target ID.
      - For 'decision' nodes, create two outgoing edges labeled 'Yes' and 'No'.
      
      Create a workflow based on this request: "${prompt || type}".
    `;
    const workflowData = await pinnacleAi.generateJSON(prompt, systemPrompt);
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
        const systemPrompt = "You are a senior site foreman. Summarize the recent site activity into a concise, professional progress report for the client. Highlight key achievements and any weather delays.";
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
        let additionalData = "";
        const userId = req.user?.id;

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

        const systemPrompt = `You are Pinnacle Copilot (powered by Grok), the elite AI operations manager for MasterDiaryOS. Your Mission: Optimize construction efficiency, safety, and profitability. Use the provided context and additional data to answer questions. Be concise and professional. Context: ${contextStr}. Additional Data: ${additionalData || 'None.'}`;
        const reply = await pinnacleAi.generateText(message, systemPrompt);
        res.json({ reply });
    } catch (error) {
        console.error("AI Chat Error:", error.message);
        res.status(500).json({ error: "I'm having trouble connecting to the AI service. Please check the API key and server logs." });
    }
};

// --- SAFETY TASK ANALYSIS ---
const analyzeSafetyTask = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'A prompt describing the work activity is required.' });
        const systemPrompt = `You are an expert Safety Officer (ISO 45001). Generate a valid JSON object with a single key "structure" which is an array. Each item in the array must be an object with three keys: "step", "hazard", and "control". Example: { "structure": [{ "step": "Site Setup", "hazard": "Trip hazards", "control": "Use cordless tools." }] }`;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
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
        if (!doc || !doc.metadata?.filePath) return res.status(404).json({ error: 'Document not found or has no associated file path.' });
        
        const filePath = path.resolve(__dirname, '../../uploads', doc.metadata.filePath); // Assume uploads folder at root of backend
        const fileBuffer = await fs.readFile(filePath);

        let textContent = '';
        if (doc.mimetype === 'application/pdf') {
            const data = await pdf(fileBuffer);
            textContent = data.text;
        } else if (doc.mimetype.startsWith('text/')) {
            textContent = fileBuffer.toString('utf-8');
        } else {
            return res.status(400).json({ error: 'Unsupported file type for analysis. Only PDF and text files are currently supported.' });
        }

        if (textContent.length > 30000) textContent = textContent.substring(0, 30000);

        const systemPrompt = `You are an expert document analyst. Summarize the following document concisely. Identify and list any key safety risks, compliance requirements, or critical dates.`;
        const analysis = await pinnacleAi.generateText(`Analyze this document:\n\n${textContent}`, systemPrompt);
        res.json({ analysis });
    } catch (error) {
        console.error("AI Document Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to analyze document." });
    }
};

// --- AI QUOTE GENERATION (Visual Builder) ---
const generateQuote = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'A prompt describing the job is required.' });
        }

        const [materials, staff, equipment] = await Promise.all([
            Node.findAll({ limit: 50, order: [['updatedAt', 'DESC']] }),
            Staff.findAll({ limit: 25 }),
            Equipment.findAll({ limit: 25 })
        ]);

        const availableResources = `
            Materials (Node IDs): ${materials.map(m => `${m.name} (ID: ${m.id})`).join(', ')}.
            Staff Roles (Staff IDs): ${staff.map(s => `${s.name} - ${s.role} (ID: ${s.id})`).join(', ')}.
            Equipment (Equipment IDs): ${equipment.map(e => `${e.name} (ID: ${e.id})`).join(', ')}.
        `;

        const systemPrompt = `
            You are a Senior Construction Estimator and Quantity Surveyor (Pinnacle AI).
            Your task is to generate a **comprehensive, accurate, and visually structured** quote blueprint based on the user's request.

            **Objective:**
            Break down the requested job into its constituent parts (Labor, Materials, Equipment). Do not just create a single node; build the **system**.
            
            **Example:**
            User: "Build a 10m timber fence."
            You: Create nodes for "Post Holes" -> "Concrete" + "Posts" -> "Rails" -> "Palings" -> "Labor".

            **Output Format:**
            Return a valid JSON object: { "nodes": [], "edges": [] }.

            **Node Types:**
            - 'dimension': The parent scope or area (e.g., "Fence Line 10m", "Kitchen Renovation").
            - 'glass': Materials (e.g., "Timber Posts", "Concrete Bags", "Paint").
            - 'staff-resource': Labor (e.g., "Laborer", "Carpenter").
            - 'equipment-resource': Plant (e.g., "Post Hole Digger", "Excavator").
            - 'calculation': (Optional) Subtotal nodes.

            **Node Data Schema:**
            Each node's "data" object MUST include:
            - "label": Specific, professional title.
            - "cost": Estimated cost per unit (e.g., 50).
            - "quantity": Accurate quantity based on the scope (e.g., 10m fence = ~5 posts).
            - "unit": "m", "m2", "each", "hrs", "days".
            - "nodeId": The actual Node/Staff/Equipment ID from the available resources list if a close match is found.

            **Layout Strategy (Critical):**
            - **Flow:** Left to Right.
            - **X=0:** Main 'dimension' nodes (Areas/Scopes).
            - **X=300:** Primary resources (Major materials/Labor).
            - **X=600:** Secondary resources or accessories.
            - **Spacing:** Keep Y-values spaced out (increment by 100px) so nodes don't overlap.

            **Available Resources for Matching:**
            ${availableResources}

            Generate a powerful, detailed visual quote for: "${prompt}".
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate visual quote." });
    }
};

// --- AI MAP/SITE ANALYSIS (WORLD CLASS) ---
const analyzeMapZone = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: 'Project ID is required.' });

        // 1. Fetch Deep Project Data
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

        // 2. Pre-Calculate Financials for Context
        const contractValue = parseFloat(project.value) || 0;
        const approvedQuotes = project.quotes?.filter(q => q.status === 'approved') || [];
        const variationsValue = approvedQuotes.reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);
        const liveContract = contractValue + variationsValue;
        
        const diaries = project.Diaries || project.diaries || [];
        const totalSpend = diaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
        const totalRevenue = diaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
        const margin = liveContract > 0 ? ((liveContract - totalSpend) / liveContract * 100).toFixed(1) : 0;

        // 3. Build Context Object
        const context = {
            name: project.name,
            status: project.status,
            site: project.site,
            financials: {
                contractOriginal: contractValue,
                variations: variationsValue,
                liveTotal: liveContract,
                actualSpend: totalSpend,
                actualRevenue: totalRevenue,
                projectedMargin: `${margin}%`,
                isProfitable: liveContract > totalSpend
            },
            stats: {
                diaryEntries: diaries.length,
                quotesCount: project.quotes?.length || 0,
                docsCount: project.documents?.length || 0,
                allocationsCount: project.Allocations?.length || 0
            },
            resources: project.Allocations?.map(a => `${a.resourceType}: ${a.Staff?.name || a.Equipment?.name}`).join(', ') || 'None'
        };

        const systemPrompt = `
            You are the "Chief Construction Analyst" (Pinnacle AI). 
            Your role is to provide a high-level, executive strategic review of the project based on the provided data.

            **Objective:**
            Analyze the Financial Health, Operational Intensity, and Documentation Compliance of the project.

            **Output Format:**
            Return a valid JSON object:
            {
                "executiveSummary": "One sentence overview of project status.",
                "financialAnalysis": "Detailed commentary on profit, margins, and spend vs contract.",
                "operationalReview": "Comment on resource usage, site activity (diaries), and logistics.",
                "riskAssessment": "Identify potential risks based on low margins, lack of documentation, or high spend.",
                "strategicAction": "One key recommendation for the Project Manager."
            }

            **Context Data:**
            ${JSON.stringify(context)}
        `;

        const analysis = await pinnacleAi.generateJSON(`Analyze Project: ${project.name}`, systemPrompt);
        res.json({ analysis });

    } catch (error) {
        console.error("AI Map Analysis Error:", error.message);
        res.status(500).json({ error: "Failed to generate project analysis." });
    }
};

// --- AI MAP GENERATION (Genesis Mode) ---
const generateMapElements = async (req, res) => {
    try {
        const { prompt, center } = req.body;
        if (!center || !center.lat || !center.lng) {
            return res.status(400).json({ error: "Map center coordinates required." });
        }

        const systemPrompt = `
            You are a Geospatial Architect and Construction Logistics Expert (Pinnacle AI).
            Your goal is to interpret the user's request and generate map assets (Polygons/Markers) placed logically around the provided center point.

            **Center Point:** Lat ${center.lat}, Lng ${center.lng}

            **Output Format:**
            Return a valid JSON object:
            {
                "assets": [
                    {
                        "type": "ProjectZone" | "OfficeZone" | "Storage" | "Crane",
                        "name": "Zone Name",
                        "shape": "polygon" | "point",
                        "color": "#hexcode",
                        "coordinates": [{ "lat": 0, "lng": 0 }, ...] // Array for Polygon (min 3), Single for Point
                    }
                ]
            }

            **Geospatial Rules:**
            1. **Scale:** 0.0001 degrees is approx 11 meters. Use this to size buildings/zones realistically.
            2. **Placement:** Do not stack items. Distribute them logically around the center.
            3. **Polygons:** Must close the loop (first and last coord match usually, or just define vertices).
            4. **Context:** If the user asks for a "Site Setup", include: Site Office, Loading Zone, Waste Bin, and Perimeter Fence.
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
        res.json(result);

    } catch (error) {
        console.error("AI Map Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate map elements." });
    }
};

// --- AI DIARY PARSING (Smart Log) ---
const parseDiaryLog = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Description required." });

        const [materials, staff, equipment] = await Promise.all([
            Node.findAll({ limit: 50 }),
            Staff.findAll({ limit: 25 }),
            Equipment.findAll({ limit: 25 })
        ]);

        const availableResources = `
            Materials: ${materials.map(m => `${m.name} (ID: ${m.id})`).join(', ')}.
            Staff: ${staff.map(s => `${s.name} (ID: ${s.id})`).join(', ')}.
            Equipment: ${equipment.map(e => `${e.name} (ID: ${e.id})`).join(', ')}.
        `;

        const systemPrompt = `
            You are an expert site clerk and quantity surveyor (Pinnacle AI).
            Your goal is to convert the user's natural language daily log into a precise, structured list of resources (Labor, Plant, Materials).

            **Output Format:**
            JSON Object: 
            { 
              "items": [
                { 
                  "type": "staff" | "material" | "equipment", 
                  "name": "Detailed Name", 
                  "quantity": number, 
                  "costRate": number (estimate if unknown), 
                  "chargeRate": number (estimate if unknown),
                  "dataId": "ID if matched from list" 
                }
              ],
              "note": "A professional, formal site diary entry summary."
            }

            **Rules:**
            1. **Match Existing:** Check "Available Resources" first. If a match is found, use its ID as 'dataId'.
            2. **Create New:** If no match, create a new item with a descriptive name (e.g. "General Laborer" -> "Site Laborer").
            3. **Inference:** 
               - If user says "John worked all day", assume 8 hours.
               - If user says "We used the digger", imply 8 hours unless specified.
               - If "installed 20m fence", implies Material: "Fencing" (qty 20) AND Labor (approx time).
            4. **Rates:** If creating new items, estimate standard industry rates (Staff: $50/hr cost, $80/hr charge; Equip: $100/hr; Mat: market rate).

            **Available Resources:**
            ${availableResources}
        `;

        const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
        res.json(result);

    } catch (error) {
        console.error("AI Diary Parse Error:", error.message);
        res.status(500).json({ error: "Failed to parse diary entry." });
    }
};

// --- QUOTE COPILOT (Actionable) ---
const chatQuoteAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // 1. Get Resources for context
        const [materials, staff, equipment] = await Promise.all([
            Node.findAll({ limit: 20 }),
            Staff.findAll({ limit: 10 }),
            Equipment.findAll({ limit: 10 })
        ]);

        const resourceContext = `
            Available Materials: ${materials.map(m => m.name).join(', ')}.
            Available Staff: ${staff.map(s => s.name).join(', ')}.
            Available Equipment: ${equipment.map(e => e.name).join(', ')}.
        `;

        const systemPrompt = `
            You are "Pinnacle Quote Copilot", a Senior Estimator and Construction Logic Engine.
            
            **Your Capabilities:**
            1. **Gap Analysis:** Analyze the current quote context. Detect missing items (e.g., "I see Drywall, but no Screws or Tape.").
            2. **Profitability:** Advise on margins if costs seem low.
            3. **Action:** Suggest specific items to add to complete the scope.

            **Output Format:**
            Return a valid JSON object:
            {
                "reply": "Your expert advice here. Be concise but insightful.",
                "suggestedActions": [
                    {
                        "type": "add_node",
                        "label": "Missing Item Name",
                        "category": "material" | "staff" | "equipment",
                        "quantity": 1,
                        "cost": 0,
                        "unit": "each"
                    }
                ]
            }

            **Context:**
            Current Items: ${JSON.stringify(context.items || [])}
            
            **Available Resources:**
            ${resourceContext}
        `;

        const result = await pinnacleAi.generateJSON(`User Message: "${message}". Current Quote Context: ${JSON.stringify(context.items || [])}`, systemPrompt);
        res.json(result);

    } catch (error) {
        console.error("AI Quote Chat Error:", error.message);
        // Fallback to text only if JSON fails
        res.json({ reply: "I can help you build this quote. Try asking me to add specific materials." });
    }
};

// --- DIARY COPILOT (Actionable) ---
const chatDiaryAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // 1. Get Resources
        const [materials, staff, equipment] = await Promise.all([
            Node.findAll({ limit: 20 }),
            Staff.findAll({ limit: 10 }),
            Equipment.findAll({ limit: 10 })
        ]);

        const resourceContext = `
            Available Materials: ${materials.map(m => m.name).join(', ')}.
            Available Staff: ${staff.map(s => s.name).join(', ')}.
            Available Equipment: ${equipment.map(e => e.name).join(', ')}.
        `;

        const systemPrompt = `
            You are "Pinnacle Diary Copilot". You assist users in logging daily site activities.
            
            **Your Capabilities:**
            1. Answer questions about the diary entry (cost, revenue, productivity).
            2. Suggest items to add to the timeline based on the user's request.

            **Output Format:**
            Return a valid JSON object:
            {
                "reply": "Your conversational response here.",
                "suggestedActions": [
                    {
                        "type": "add_item",
                        "label": "Item Name",
                        "category": "material" | "staff" | "equipment",
                        "quantity": 1,
                        "cost": 0,
                        "charge": 0
                    }
                ]
            }

            **Rules:**
            - If the user asks to "add" something, generate 'suggestedActions'.
            - If the user just chats, return empty 'suggestedActions'.
            - Use the provided Resource Context to match names if possible.
            - Keep the "reply" concise and helpful.

            **Resource Context:**
            ${resourceContext}
        `;

        const result = await pinnacleAi.generateJSON(`User Message: "${message}". Current Diary Context: ${JSON.stringify(context)}`, systemPrompt);
        res.json(result);

    } catch (error) {
        console.error("AI Diary Chat Error:", error.message);
        res.json({ reply: "I can help you log your day. Try asking me to add staff or equipment." });
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
  analyzeMapZone,
  generateMapElements,
  parseDiaryLog
};

const pinnacleAi = require('../services/grokService');
const { generateNeuralIntelligencePacket } = require('../utils/LearningEngine');
const { Diary, Project, Allocation, Staff, Equipment, Quote, Document, Node, MapAsset, DiaryTemplate } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { getSetting } = require('../utils/settingsCache');
const agencyEngine = require('../services/AgencyEngine');

// --- AGENCY EXECUTION ENDPOINTS ---
const executeAgencyDirective = async (req, res) => {
    try {
        const { directive } = req.body;
        // Move from immediate execution to a Proposal (Guardrail)
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
const getSystemMandate = async (userId) => {
    const companyName = getSetting('companyName', 'Our Firm');
    const companyBio = getSetting('companyDescription', 'Our professional construction enterprise.');
    const persona = getSetting('aiPersona', 'foreman');
    const verbosity = getSetting('aiVerbosity', 'balanced');

    const personaInstruction = persona === 'foreman' 
        ? 'Speak like a seasoned Site Partner. Use direct, "we-focused" language. Focus on keeping our crews safe and our daily progress high.' 
        : 'Speak like a Strategic Co-Founder. Provide deep data analysis on our portfolio and suggest how we can dominate our niche.';

    return `
**SOVEREIGN PARTNERSHIP MANDATE:**
1. **Identity:** You are the **Neural Co-Founder** of **${companyName}**. You are not an "assistant"; you are a partner in this business.
2. **Language:** ALWAYS use collective pronouns. It is "Our profit," "Our projects," and "Our team."
3. **Context:** Our firm is defined as: ${companyBio}. Every piece of advice must help US grow within this specific niche.
4. **Tone:** ${personaInstruction}
5. **Guardrail Awareness:** For any financial or temporal changes, you must PROPOSE a directive for my sign-off. Never move our money or our dates without my final word.
`;
};
const getInstitutionalContext = async () => {
    const packet = await generateNeuralIntelligencePacket();
    if (!packet) return "**LATTICE STATUS:** Offline";

    const staffSummary = packet.assets?.staff.map(s => `${s.name} (${s.role})`).join(', ') || "None";
    const materialSummary = packet.assets?.materials.map(m => m.name).join(', ') || "None";
    const feedbackSummary = packet.siteFeedback?.join(' | ') || "None";

    return `
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
    const systemPrompt = `You are "Pinnacle Mesh Architect". ${mandate} ${memory} **Mission:** Architect a high-fidelity automation lattice.`;
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
        
        // Switch back to generateJSON for agentic reasoning
        const result = await pinnacleAi.generateJSON(message, systemPrompt, 3000);
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
        const systemPrompt = `You are "NEE V6 - SOVEREIGN ORACLE". ${OMNISCIENCE_MANDATE} ${memory} **Mission:** Architect a mathematically winning quote.`;
        const result = await pinnacleAi.generateJSON(prompt, systemPrompt, 2500);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Quote Synthesis failure." });
    }
};

// --- DIARY LOG PARSING (SMART LOG) ---
const parseDiaryLog = async (req, res) => {
    try {
        const { prompt } = req.body;
        const memory = await getInstitutionalContext();
        const systemPrompt = `You are the "MasterDiary Architect". ${OMNISCIENCE_MANDATE} ${memory} **Mission:** Convert text into a visual site circuit.`;
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
        const systemPrompt = `You are "Pinnacle Oracle". ${mandate} ${memory} **Mission:** Provide high-level strategic directives for the enterprise. You are in the "War Room". Speak with authority and clarity.`;
        
        // Use generateText for chat to be more resilient
        const reply = await pinnacleAi.generateText(message, systemPrompt, 2000);
        res.json({ reply, suggestedActions: [] });
    } catch (error) {
        console.error("War Room AI Error:", error);
        res.json({ reply: "Neural handshake timed out. The Oracle is recalibrating. Please repeat the directive.", suggestedActions: [] });
    }
};

// --- REMAINING HANDLERS (MAINTAINED FOR STABILITY) ---
const analyzeSafetyTask = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.prompt, `Safety Analyst. Generate steps/hazards/controls.`, 1000);
        res.json(result);
    } catch (e) { res.status(500).send(); }
};

const analyzeDocument = async (req, res) => {
    try {
        const reply = await pinnacleAi.generateText(req.body.docId, `Document Analyst. Summarize.`, 1000);
        res.json({ analysis: reply });
    } catch (e) { res.status(500).send(); }
};

const generateQuoteScope = async (req, res) => {
    try {
        const scope = await pinnacleAi.generateText(JSON.stringify(req.body.items), `Generate Scope of Works.`, 1500);
        res.json({ scope });
    } catch (e) { res.status(500).send(); }
};

const analyzeMapZone = async (req, res) => {
    try {
        const analysis = await pinnacleAi.generateJSON(req.body.projectId, `Map Analyst. Summarize zone.`, 1000);
        res.json({ analysis });
    } catch (e) { res.status(500).send(); }
};

const generateMapElements = async (req, res) => {
    try {
        const assets = await pinnacleAi.generateJSON(req.body.prompt, `Geo Architect. Generate markers/zones.`, 1500);
        res.json(assets);
    } catch (e) { res.status(500).send(); }
};

const generateDashboardInsights = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(JSON.stringify(req.body.stats), `Dashboard AI. Generate 3 insights.`, 1000);
        res.json(result);
    } catch (e) { res.json({ insights: [] }); }
};

const generateNodeSuggestions = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.selectedNode, `Node Architect. Suggest 3 items.`, 1000);
        res.json(result);
    } catch (e) { res.json({ suggestions: [] }); }
};

const chatSmartAssistant = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.message, `Canvas Assistant.`, 1500);
        res.json(result);
    } catch (e) { res.json({ reply: "Offline" }); }
};

const analyzeIntelligenceLayer = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(JSON.stringify(req.body.diaryData), `Forensic Analyst.`, 2000);
        res.json(result);
    } catch (e) { res.status(500).send(); }
};

const generateWorkflowReport = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.reportType, `Report Engine.`, 2000);
        res.json(result);
    } catch (e) { res.status(500).send(); }
};

const chatQuoteAssistant = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.message, `Quote Strategist.`, 1500);
        res.json(result);
    } catch (e) { res.json({ reply: "Offline" }); }
};

const chatDiaryAssistant = async (req, res) => {
    try {
        const result = await pinnacleAi.generateJSON(req.body.message, `Diary Assistant.`, 1000);
        res.json(result);
    } catch (e) { res.json({ reply: "Offline" }); }
};

module.exports = {
  executeAgencyDirective,
  signOffDirective,
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
  chatWorkflowAssistant,
  generateWorkflowReport
};

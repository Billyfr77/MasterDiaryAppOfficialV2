/*
 * MasterDiaryOS - Intelligence Stack Controller
 * Modular, read-only AI nodes for advanced diary interpretation.
 * Powered by grok-4-1-fast-reasoning.
 */
const pinnacleAi = require('../services/grokService');
const { Diary, Project, Staff, Equipment } = require('../models');

// --- 2. FORECAST LAYER (Predictive Intelligence) ---
const forecastLayer = async (req, res) => {
    try {
        const { diaryData, history } = req.body;
        if (!diaryData) return res.status(400).json({ error: "Diary data required." });

        const systemPrompt = `
            You are "diary.forecastLayer.v1".
            **Mission:** Predict operational outcomes for tomorrow and the week ahead based on today's performance.
            **Mandate:** Read-only, deterministic forecasting.

            **Input Context:**
            - Today's Performance: ${JSON.stringify(diaryData)}
            - Recent History: ${JSON.stringify(history || [])}

            **Output Schema (Strict JSON):**
            {
              "forecast": {
                "tomorrow": { "productivity_trend": "rising|falling|stable", "risk_level": "low|medium|high", "key_prediction": "string" },
                "week_ahead": { "completion_probability": "0-100%", "bottleneck_alert": "string|null" }
              },
              "risks": ["string (specific future risks)"],
              "meta": { "confidence": "high", "data_coverage": "full" }
            }
        `;

        const result = await pinnacleAi.generateJSON("Generate Forecast", systemPrompt, 1000);
        res.json(result);
    } catch (error) {
        console.error("Forecast Layer Error:", error.message);
        res.status(500).json({ error: "Forecast module offline." });
    }
};

// --- 4. QUALITY LAYER (Compliance & Gaps) ---
const qualityLayer = async (req, res) => {
    try {
        const { diaryData } = req.body;
        
        const systemPrompt = `
            You are "diary.qualityLayer.v1".
            **Mission:** Detect compliance gaps, missing data, and quality risks in the diary entry.
            **Mandate:** Purely advisory. Do not auto-fix.

            **Input:** ${JSON.stringify(diaryData)}

            **Output Schema (Strict JSON):**
            {
              "quality_issues": ["string (e.g. 'Missing photos for completed task')"],
              "compliance_gaps": ["string (e.g. 'No safety officer signed off')"],
              "recommended_checks": ["string"],
              "meta": { "score": "0-100", "notes": "string" }
            }
        `;

        const result = await pinnacleAi.generateJSON("Run Quality Audit", systemPrompt, 800);
        res.json(result);
    } catch (error) {
        console.error("Quality Layer Error:", error.message);
        res.status(500).json({ error: "Quality module offline." });
    }
};

// --- 5. RISK LAYER (Unified Scoring) ---
const riskLayer = async (req, res) => {
    try {
        const { diaryData, forecast } = req.body;

        const systemPrompt = `
            You are "diary.riskLayer.v1".
            **Mission:** Compute a unified risk score across schedule, cost, and safety.
            **Mandate:** High-fidelity risk assessment.

            **Input:** 
            - Diary: ${JSON.stringify(diaryData)}
            - Forecast: ${JSON.stringify(forecast || {})}

            **Output Schema (Strict JSON):**
            {
              "risk_score": 0-100, // 100 is catastrophic
              "risk_bands": {
                "schedule": "low|medium|high",
                "cost": "low|medium|high",
                "quality": "low|medium|high",
                "weather": "low|medium|high",
                "equipment": "low|medium|high"
              },
              "explanations": ["string (why is risk high?)"],
              "meta": { "confidence": "high" }
            }
        `;

        const result = await pinnacleAi.generateJSON("Compute Risk Profile", systemPrompt, 1000);
        res.json(result);
    } catch (error) {
        console.error("Risk Layer Error:", error.message);
        res.status(500).json({ error: "Risk module offline." });
    }
};

// --- 6. STORY LAYER (Weekly Narrative) ---
const storyLayer = async (req, res) => {
    try {
        const { weeklyData } = req.body; // Array of 7 days
        
        const systemPrompt = `
            You are "diary.storyLayer.v1".
            **Mission:** Generate a cinematic weekly narrative summary.
            **Mandate:** Factual, engaging, and comprehensive.

            **Input:** ${JSON.stringify(weeklyData || [])}

            **Output Schema (Strict JSON):**
            {
              "weekly_narrative": "string (2 paragraphs)",
              "highlights": ["string"],
              "risks": ["string"],
              "actions": ["string (for next week)"],
              "meta": { "completeness": "string" }
            }
        `;

        const result = await pinnacleAi.generateJSON("Generate Weekly Story", systemPrompt, 1500);
        res.json(result);
    } catch (error) {
        console.error("Story Layer Error:", error.message);
        res.status(500).json({ error: "Story module offline." });
    }
};

// --- 3. TREND LAYER (Pattern Recognition) ---
const trendLayer = async (req, res) => {
    try {
        const { historicalData } = req.body; // Array of past entries

        const systemPrompt = `
            You are "diary.trendLayer.v1".
            **Mission:** Identify cross-day patterns in productivity and cost.
            
            **Input:** ${JSON.stringify(historicalData || [])}

            **Output Schema (Strict JSON):**
            {
              "trends": [
                { "metric": "Cost/Productivity", "direction": "up|down|flat", "insight": "string" }
              ],
              "pattern_summary": "string",
              "meta": { "depth": "string" }
            }
        `;

        const result = await pinnacleAi.generateJSON("Analyze Trends", systemPrompt, 1200);
        res.json(result);
    } catch (error) {
        console.error("Trend Layer Error:", error.message);
        res.status(500).json({ error: "Trend module offline." });
    }
};

module.exports = {
    forecastLayer,
    qualityLayer,
    riskLayer,
    storyLayer,
    trendLayer
};

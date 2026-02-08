const { Quote, Diary, Project, Node, Staff, Equipment } = require('../models');
const { Op } = require('sequelize');
const grokService = require('./grokService');

class SentinelService {
    /**
     * Core Analysis Loop: Runs whenever a diary is finalized.
     * Compares "Actual" (Diary) vs "Plan" (Quote).
     */
    async analyzeLeakage(diaryId, userId) {
        try {
            const diary = await Diary.findByPk(diaryId, {
                include: [
                    { model: Project, as: 'Project' }
                ]
            });

            if (!diary || !diary.projectId) return null;

            // 1. Fetch the "Truth" (Approved Quote)
            const quote = await Quote.findOne({
                where: { projectId: diary.projectId, status: 'approved' },
                order: [['createdAt', 'DESC']]
            });

            // If no quote exists, everything is potentially billable/leakage
            // But usually we compare against a baseline.
            const quoteNodes = quote ? (quote.nodes || []) : [];
            const diaryItems = diary.canvasData ? diary.canvasData.flatMap(e => e.items || []) : [];

            // 2. AI Forensic Scan (Semantic Analysis)
            // We use Grok to "read" the situation and find unquoted events
            const forensicPrompt = `
                You are "Sentinel", an autonomous revenue recovery engine.
                
                **CONTEXT:**
                - Project: ${diary.Project.name}
                - Diary Note: "${diary.notes || ''}"
                - Diary Items: ${JSON.stringify(diaryItems.map(i => `${i.quantity}x ${i.name} (${i.type})`))}
                - Quoted Scope: ${JSON.stringify(quoteNodes.map(n => n.data?.label || n.label).slice(0, 50))}
                
                **MISSION:**
                Identify "Leakage" - work done or materials used that DO NOT appear in the Quoted Scope.
                Look for keywords like "extra", "unexpected", "delay", "variation", "repair", "broken".
                
                **OUTPUT:**
                Return a JSON object:
                {
                    "leakageDetected": boolean,
                    "items": [
                        { "description": "String", "estimatedCost": number, "reason": "Why is this extra?" }
                    ],
                    "confidence": "high" | "medium" | "low"
                }
            `;

            const aiAnalysis = await grokService.generateJSON(forensicPrompt, "You are a ruthless Quantity Surveyor.", 2000);

            // 3. Mathematical Diff (Hard Logic)
            // Calculate absolute variance for this specific day/task if possible
            // (Simplified for V1: Trust AI + manual override)

            if (aiAnalysis?.leakageDetected) {
                return {
                    diaryId: diary.id,
                    projectId: diary.projectId,
                    projectName: diary.Project.name,
                    date: diary.date,
                    detectedItems: aiAnalysis.items,
                    totalPotentialRevenue: aiAnalysis.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0),
                    confidence: aiAnalysis.confidence
                };
            }

            return null;

        } catch (error) {
            console.error("[Sentinel] Analysis Failed:", error);
            return null;
        }
    }
}

module.exports = new SentinelService();

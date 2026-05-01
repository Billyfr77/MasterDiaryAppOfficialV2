const db = require('../models');
const { Quote, Diary, Project, Node, Staff, Equipment } = db;
const { Op } = require('sequelize');
const grokService = require('./grokService');

class SentinelService {
    /**
     * PURE FORENSIC SCAN
     */
    async analyzeLeakage(diaryId, userId) {
        try {
            const diary = await Diary.findByPk(diaryId, {
                include: [
                    { model: Project, as: 'Project' }
                ]
            });

            if (!diary || !diary.projectId) return null;

            const quote = await Quote.findOne({
                where: { projectId: diary.projectId, status: 'approved' },
                order: [['createdAt', 'DESC']]
            });

            const quoteNodes = quote ? (quote.nodes || []) : [];
            let diaryItems = [];
            if (diary.canvasData) {
                if (Array.isArray(diary.canvasData)) {
                    diaryItems = diary.canvasData.flatMap(e => e.items || []);
                } else if (diary.canvasData.items) {
                    diaryItems = diary.canvasData.items;
                }
            }

            const projectName = diary.Project?.name || "Standard Project";
            
            const forensicPrompt = `
                You are "SENTINEL V3", the ultimate Autonomous Revenue Fortress for tier-1 construction enterprises.
                Your mission is to perform a high-fidelity forensic audit of site logs to recover EVERY CENT of unbilled work.
                
                **INTELLIGENCE CONTEXT:**
                - PROJECT: ${projectName}
                - APPROVED QUOTE: ${quote ? "ACTIVE (Compare diary vs quote below)" : "NOT FOUND"}
                - DIARY NOTES: "${diary.notes || ''}"
                - DIARY ITEMS: ${JSON.stringify(diaryItems.map(i => `${i.quantity || i.duration || 1}x ${i.name} (${i.type}) - ${i.totalCost || 'Cost Unknown'}`))}
                - QUOTED ITEMS: ${JSON.stringify(quoteNodes.map(n => n.data?.label || n.label).slice(0, 100))}
                
                **RUTHLESS DETECTION PROTOCOLS:**
                1. **EXPLICIT EXTRAS:** Flag anything mentioned as "extra", "OT", "unbilled", "client request", or "not in scope".
                2. **WORK PATTERN INFERENCE:** 
                   - If the diary shows 10 workers but the quote only allowed 6 -> FLAG the delta as unbilled labor.
                   - If the diary mentions "waiting for client" or "site access delayed" -> FLAG as a Delay Claim variation.
                   - If the materials used (e.g. "Special high-gloss paint") are not in the quote -> FLAG as material upgrade.
                3. **CHRONOS MISMATCH:** If a staff member worked 12 hours but the project standard is 8 -> FLAG the 4 hours as Overtime variation.
                4. **HIDDEN SCOPE:** If the notes mention work on a "Level 5" but the quote only covers "Levels 1-4" -> FLAG.

                **FINANCIAL CALCULATION ENGINE:**
                For every flagged item, calculate the "Estimated Recovery Value" based on standard industry rates if not explicitly stated.
                
                **OUTPUT (STRICT JSON ONLY):**
                {
                    "leakageDetected": boolean,
                    "items": [
                        { 
                            "description": "Professional variation title", 
                            "estimatedCost": number, 
                            "reason": "Specific evidence from the logs",
                            "breakdown": {
                                "labor": number,
                                "materials": number,
                                "markup": number
                            },
                            "isoCitation": "Optional ISO 9001/45001 or standard contract clause (e.g. Clause 12.1)"
                        }
                    ],
                    "summary": "High-level executive summary of the loss",
                    "confidence": "high" | "medium",
                    "accuracyScore": number
                }
            `;

            let aiAnalysis;
            try {
                aiAnalysis = await grokService.generateJSON(forensicPrompt, "You are SENTINEL V3. Perform a ruthless forensic audit.", 3500);
            } catch (aiErr) {
                console.error("[Sentinel] Grok Error:", aiErr.message);
                return null;
            }

            if (aiAnalysis && aiAnalysis.leakageDetected && Array.isArray(aiAnalysis.items)) {
                let totalPotentialRevenue = aiAnalysis.items.reduce((acc, i) => acc + (parseFloat(i.estimatedCost) || 0), 0);
                totalPotentialRevenue = Math.round(totalPotentialRevenue * 100) / 100;

                return {
                    diaryId: diary.id,
                    projectId: diary.projectId,
                    projectName: projectName,
                    date: diary.date,
                    detectedItems: aiAnalysis.items,
                    totalPotentialRevenue,
                    summary: aiAnalysis.summary,
                    confidence: aiAnalysis.confidence || "medium",
                    accuracyScore: aiAnalysis.accuracyScore || 95
                };
            }

            return null;
        } catch (error) {
            console.error("[Sentinel] Analysis Failed:", error);
            return null;
        }
    }

    /**
     * PROCESS DIARY: Entry point with deduplication
     */
    async processDiary(diaryId, userId) {
        try {
            console.log(`[Sentinel] Processing Diary ${diaryId} for User ${userId}`);
            
            // 0. PRE-FLIGHT CHECK: Is this diary already invoiced?
            const diary = await Diary.findByPk(diaryId);
            if (!diary) return null;
            if (diary.invoiceId) {
                console.log(`[Sentinel] Diary ${diaryId} already invoiced. Skipping scan.`);
                return null;
            }

            const result = await this.analyzeLeakage(diaryId, userId);
            if (!result) return null;

            const Notification = db.Notification || require('../models/notification')(db.sequelize, db.Sequelize.DataTypes);

            // DEDUPLICATION: Check for ANY existing alert for this diary (read or unread)
            // Fetching all to be dialect-agnostic with JSON filtering
            const allAlerts = await Notification.findAll({
                where: { userId, type: 'sentinel_alert' }
            });

            const existingAlert = allAlerts.find(n => {
                const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
                return data && data.diaryId === diaryId;
            });

            if (existingAlert) {
                // If it's already been read, we don't want to bug them again.
                if (!existingAlert.isRead) {
                    const oldRevenue = existingAlert.data?.totalPotentialRevenue || 0;
                    const newRevenue = result.totalPotentialRevenue;
                    const percentChange = oldRevenue > 0 ? Math.abs((newRevenue - oldRevenue) / oldRevenue) : 1;

                    // Only update if revenue changed by more than 10% to avoid AI jitter/noise
                    if (percentChange > 0.10) {
                        console.log(`[Sentinel] Updating unread alert for Diary ${diaryId} (Significant change: $${oldRevenue} -> $${newRevenue})`);
                        await existingAlert.update({
                            message: `Sentinel found $${newRevenue.toLocaleString()} in recoverable variations on ${result.projectName}.`,
                            data: result
                        });
                    } else {
                        console.log(`[Sentinel] Suppressing jitter update for Diary ${diaryId}`);
                    }
                } else {
                    console.log(`[Sentinel] Alert already read for Diary ${diaryId}. Suppressing new notification.`);
                }
                return result;
            }

            // Create New Signal
            await Notification.create({
                userId,
                type: 'sentinel_alert',
                title: '💸 Revenue Leakage Detected',
                message: `Sentinel found $${result.totalPotentialRevenue.toLocaleString()} in recoverable variations on ${result.projectName}.`,
                data: result,
                isRead: false
            });

            console.log(`[Sentinel] New Alert Raised for Diary ${diaryId}`);
            return result;
        } catch (err) {
            console.error("[Sentinel] Process Error:", err.message);
            return null;
        }
    }

    /**
     * BATCH DEEP SCAN: Rescans all project diaries for missed revenue
     * This is the "Nuclear Option" for Enterprise Revenue Recovery.
     */
    async performGlobalProjectScan(projectId, userId) {
        try {
            console.log(`🚀 [Sentinel V3] Initiating Global Deep Scan for Project ${projectId}...`);
            const diaries = await Diary.findAll({
                where: { projectId, invoiceId: null }
            });

            const stats = {
                diariesScanned: diaries.length,
                newLeakageFound: 0,
                totalRevenueUnlocked: 0,
                scannedDiaryIds: []
            };

            // Process sequentially to protect the AI context window and respect rate limits
            for (const diary of diaries) {
                const result = await this.analyzeLeakage(diary.id, userId);
                if (result && result.leakageDetected) {
                    stats.newLeakageFound++;
                    stats.totalRevenueUnlocked += result.totalPotentialRevenue;
                    stats.scannedDiaryIds.push(diary.id);
                    
                    // Create notification if significant
                    await this.processDiary(diary.id, userId);
                }
            }

            console.log(`✅ [Sentinel V3] Deep Scan Complete. Recovered: $${stats.totalRevenueUnlocked.toLocaleString()}`);
            return stats;
        } catch (err) {
            console.error("[Sentinel] Global Scan Error:", err.message);
            throw err;
        }
    }
}

module.exports = new SentinelService();

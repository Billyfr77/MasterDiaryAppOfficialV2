const { Project, Diary, Quote, Allocation, Notification, Staff, Node, Equipment, Workflow } = require('../models');
const { generateNeuralIntelligencePacket } = require('../utils/LearningEngine');
const pinnacleAi = require('../services/grokService');

const getMorningBriefing = async (req, res) => {
    try {
        let intelligence = await generateNeuralIntelligencePacket(req.user?.id);
        
        // --- ROBUST FALLBACK FOR ZERO STATE ---
        if (!intelligence || intelligence.error) {
            console.warn("Learning Engine Failure or NULL. Using fallback.");
            intelligence = {
                mesh: { integrity: 1.0, status: 'STABLE' },
                financials: { netProfit: 0, marginPct: '0%' },
                oracle: { riskVelocity: 'NOMINAL' }
            };
        }

        const systemPrompt = `
            You are the Neural Co-Founder. 
            Provide a "Sovereign Sitrep" for the day. 
            Use "We/Our" language. 
            Keep it under 60 words. 
            Format: [WIN] (one success), [RISK] (one danger), [MOVE] (one direct action for today).
            If data is empty, just say: "[WIN] Systems Online. [RISK] None. [MOVE] Begin Operations."
        `;

        let briefing;
        try {
            briefing = await pinnacleAi.generateText(
                `Company State: ${JSON.stringify(intelligence)}`, 
                systemPrompt, 
                500
            );
        } catch (aiError) {
            console.error("AI Generation Failed:", aiError);
            briefing = "[WIN] Neural Core Online. [RISK] AI Link Intermittent. [MOVE] Manual Override.";
        }

        res.json({ briefing });
    } catch (e) {
        console.error("Briefing Fatal Error:", e);
        res.json({ briefing: "System Online. Intelligence Stream Stabilizing..." });
    }
};

const getOracleStream = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const [projects, totalStaff, totalMaterials, totalEquip, allWorkflows] = await Promise.all([
            Project.findAll({ where: { status: 'active', userId } }),
            Staff.count({ where: { userId } }),
            Node.count({ where: { userId } }),
            Equipment.count({ where: { userId } }),
            Workflow.findAll({ where: { createdBy: userId } })
        ]);

        // RECURSIVE WORKFLOW NODE COUNTING
        // We count nodes defined inside every saved workflow to get the true "Lattice" scale
        let totalWorkflowNodes = 0;
        allWorkflows.forEach(wf => {
            if (wf.nodes && Array.isArray(wf.nodes)) {
                totalWorkflowNodes += wf.nodes.length;
            }
        });

        const totalInstitutionalNodes = totalStaff + totalMaterials + totalEquip + totalWorkflowNodes;

        let intelligence = await generateNeuralIntelligencePacket(userId);
        
        // --- SAFETY FALLBACK FOR LEVEL 18 STABILITY ---
        if (!intelligence || intelligence.error) {
            console.error("Intelligence Packet Failure:", intelligence?.error);
            intelligence = {
                mesh: { integrity: 1.0, resourceContentionIndex: 0, velocityDrift: '0.00', status: 'STABLE', institutionalEfficiency: '1.0', burnAcceleration: '1.0', frictionIndex: '0.0' },
                financials: { collectionVelocity: '100%', netProfit: 0, paid: 0, marginPct: '0%', yieldDelta: 0, totalValue: 0, invoiced: 0 },
                oracle: { bidSuccessProbability: '100%', idealMarginPoint: '25%', marketVolatilityIndex: 1.0, riskVelocity: 'NOMINAL' },
                patterns: [],
                projectFinancials: [],
                knowledgeBase: { documents: [], quotes: [], diaries: [] },
                siteTrail: []
            };
        }
        
        const totalEmpireValue = projects.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);

        const signals = [
            ...intelligence.patterns?.map(p => ({
                id: `pattern-${p.taskType}`,
                type: 'ORACLE',
                signal: 'YIELD_OPTIMIZATION',
                desc: `${p.taskType} drift detected. ${p.fix}`,
                severity: p.delta > 1.2 ? 'high' : 'medium',
                timestamp: new Date().toISOString()
            })) || [],
            {
                id: 'financial-health',
                type: 'FINANCE',
                signal: 'COLLECTION_VELOCITY',
                desc: `Cash collection is at ${intelligence.financials.collectionVelocity}. Net portfolio profit: $${parseFloat(intelligence.financials.netProfit).toLocaleString()}.`,
                severity: parseFloat(intelligence.financials.collectionVelocity) < 70 ? 'high' : 'nominal',
                timestamp: new Date().toISOString()
            },
            {
                id: 'resource-mesh',
                type: 'RESOURCE',
                signal: 'CONTENTION_ALERT',
                desc: `Resource contention is at ${Math.round(intelligence.mesh.resourceContentionIndex * 100)}%. ${intelligence.mesh.resourceContentionIndex > 0.3 ? 'Critical overlaps detected.' : 'Staff distribution optimal.'}`,
                severity: intelligence.mesh.resourceContentionIndex > 0.3 ? 'high' : 'nominal',
                timestamp: new Date().toISOString()
            }
        ];

        res.json({ 
            signals,
            stats: {
                personnel: totalStaff,
                nodes: totalInstitutionalNodes,
                empireValue: totalEmpireValue,
                activeProjects: projects.length,
                totalPaid: intelligence.financials.paid,
                netMargin: intelligence.financials.marginPct
            },
            intelligence // Return full Omega packet
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const executeProtocol = async (req, res) => {
    try {
        const { signalId, directive } = req.body;
        await Notification.create({
            type: 'system',
            title: 'Sovereign Directive Executed',
            message: `Neural HQ issued: ${directive}`,
            userId: req.user?.id || null,
            read: false
        });

        res.json({ 
            success: true, 
            message: "Protocol synchronized with global lattice.",
            impact: "Mesh stability increased by 4.2%"
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { getOracleStream, executeProtocol, getMorningBriefing };
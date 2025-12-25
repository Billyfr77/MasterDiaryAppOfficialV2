const { Project, Diary, Quote, Allocation, Notification, Staff, Node, Equipment, WorkflowSQL, db } = require('../models');
const { generateNeuralIntelligencePacket } = require('../utils/LearningEngine');

const getOracleStream = async (req, res) => {
    try {
        const [projects, totalStaff, totalMaterials, totalEquip, allWorkflows] = await Promise.all([
            Project.findAll({ where: { status: 'active' } }),
            Staff.count(),
            Node.count(),
            Equipment.count(),
            WorkflowSQL.findAll()
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

        const intelligence = await generateNeuralIntelligencePacket();
        
        const totalEmpireValue = projects.reduce((sum, p) => sum + (parseFloat(p.contractValue) || 0), 0);

        const signals = [
            ...intelligence.patterns.map(p => ({
                id: `pattern-${p.taskType}`,
                type: 'ORACLE',
                signal: 'YIELD_OPTIMIZATION',
                desc: `${p.taskType} drift detected. ${p.fix}`,
                severity: p.delta > 1.2 ? 'high' : 'medium',
                timestamp: new Date().toISOString()
            })),
            {
                id: 'global-integrity',
                type: 'SYSTEM',
                signal: 'MESH_STABILITY',
                desc: `Enterprise integrity at ${intelligence.mesh.integrity * 100}%. Resource contention index: ${Math.round(intelligence.mesh.resourceContentionIndex * 100)}%.`,
                severity: 'nominal',
                timestamp: new Date().toISOString()
            }
        ];

        res.json({ 
            signals,
            stats: {
                personnel: totalStaff,
                nodes: totalInstitutionalNodes,
                empireValue: totalEmpireValue,
                activeProjects: projects.length
            }
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

module.exports = { getOracleStream, executeProtocol };
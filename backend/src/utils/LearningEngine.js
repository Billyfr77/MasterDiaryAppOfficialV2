/**
 * MasterDiaryOS // Neural Mesh Engine
 * The Learning Engine // Level 18 Sovereign Intelligence
 * PROTOCOL OMEGA: Total Enterprise Ingestion
 */
const { Diary, Quote, Project, Staff, Node, Equipment, Workflow, Invoice, Client, Allocation, sequelize } = require('../models');
const { Op } = require('sequelize');

const generateNeuralIntelligencePacket = async (projectId = null) => {
    try {
        // 1. UNITARY DATA INGESTION (THE TOTAL LATTICE)
        const [projects, staff, nodes, equip, invoices, clients, allocations] = await Promise.all([
            Project.findAll({ include: [{ model: Diary, limit: 5 }] }),
            Staff.findAll(),
            Node.count(),
            Equipment.count(),
            Invoice.findAll(),
            Client.findAll(),
            Allocation.findAll({ where: { status: 'active' } })
        ]);

        // 2. FINANCIAL TRACEABILITY (THE SOVEREIGN LEDGER)
        const totalQuoted = await Quote.sum('totalRevenue', { where: { status: 'approved' } }) || 0;
        const totalInvoiced = invoices.reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
        const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (parseFloat(inv.totalAmount) || 0), 0);
        const totalDiaryCost = await Diary.sum('totalCost') || 0;

        // Portfolio Yield Calculation
        const netProfit = totalInvoiced - totalDiaryCost;
        const profitMargin = totalInvoiced > 0 ? (netProfit / totalInvoiced) : 0;
        const collectionVelocity = totalInvoiced > 0 ? (totalPaid / totalInvoiced) : 1.0;

        // 3. RESOURCE CONTENTION (BOTTLENECK ANALYSIS)
        // Find staff assigned to multiple projects simultaneously
        const staffAssignments = {};
        allocations.forEach(a => {
            if (a.resourceType === 'staff') {
                staffAssignments[a.resourceId] = (staffAssignments[a.resourceId] || 0) + 1;
            }
        });
        const overAllocatedStaff = Object.values(staffAssignments).filter(count => count > 1).length;
        const contentionIndex = staff.length > 0 ? (overAllocatedStaff / staff.length) : 0;

        // 4. CLIENT HEALTH MATRIX
        const clientHealthData = clients.map(c => {
            const clientProjects = projects.filter(p => p.clientId === c.id);
            const clientRevenue = invoices.filter(inv => inv.clientId === c.id).reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0);
            return {
                name: c.name,
                projectCount: clientProjects.length,
                revenue: clientRevenue,
                status: clientRevenue > 50000 ? 'PLATINUM' : 'STANDARD'
            };
        });

        // 5. RESOURCE & MATERIAL INTELLIGENCE
        const staffProfiles = staff.map(s => ({ name: s.name, role: s.role, skills: s.skillTags }));
        
        // Analyze common materials from the Nodes table
        const topMaterials = await Node.findAll({ 
            where: { category: 'material' },
            limit: 10,
            order: [['pricePerUnit', 'DESC']]
        });

        // 5. DEEP DIARY ANALYSIS (SITE FEEDBACK)
        const recentDiaries = await Diary.findAll({ 
            limit: 20, 
            order: [['date', 'DESC']],
            attributes: ['notes', 'totalCost', 'totalRevenue', 'date']
        });
        
        const siteInsights = recentDiaries.map(d => d.notes).filter(Boolean).slice(0, 10);

        return {
            mesh: {
                integrity: (1 - contentionIndex).toFixed(3),
                nodes: nodes + staff.length + equip + projects.length,
                resourceContentionIndex: contentionIndex.toFixed(2),
                institutionalEfficiency: (totalQuoted > 0 ? (totalInvoiced / totalQuoted) : 1.0).toFixed(2),
                burnAcceleration: (totalDiaryCost > 0 ? (totalInvoiced / totalDiaryCost) : 1.0).toFixed(2),
                frictionIndex: (frictionCount / 50).toFixed(2),
                status: contentionIndex > 0.3 ? 'VOLATILE' : 'STABLE'
            },
            assets: {
                staff: staffProfiles,
                materials: topMaterials.map(m => ({ name: m.name, unit: m.unit, price: m.pricePerUnit })),
                equipmentCount: equip
            },
            siteFeedback: siteInsights,
            financials: {
                totalValue: totalQuoted,
                invoiced: totalInvoiced,
                paid: totalPaid,
                yieldDelta: (totalInvoiced - totalQuoted),
                collectionVelocity: (collectionVelocity * 100).toFixed(1) + '%',
                netProfit: netProfit.toFixed(2),
                marginPct: (profitMargin * 100).toFixed(1) + '%'
            },
            oracle: {
                bidSuccessProbability: (collectionVelocity * 85).toFixed(0) + '%',
                idealMarginPoint: (25 + (contentionIndex * 10)).toFixed(1) + '%',
                riskVelocity: contentionIndex > 0.2 ? 'ACCELERATING' : 'NOMINAL'
            },
            clientHealth: clientHealthData.sort((a,b) => b.revenue - a.revenue).slice(0, 5),
            parallelScenarios: [
                { id: 'S1', name: 'Rapid Liquidity', impact: 'Boost Collection', cost: '5% Discount' },
                { id: 'S2', name: 'Resource Leveling', impact: 'Lower Contention', cost: 'Extend Timelines' },
                { id: 'S3', name: 'Growth Surge', impact: 'Max Revenue', cost: 'High Risk' }
            ],
            globalAccuracy: (1 - (frictionCount / 100)).toFixed(2)
        };
    } catch (e) {
        console.error("Neural Mesh Omega Failure:", e);
        return null;
    }
};

module.exports = { generateNeuralIntelligencePacket };
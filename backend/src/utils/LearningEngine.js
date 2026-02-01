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
            Project.findAll({ include: [{ model: Diary, limit: 5, order: [['date', 'DESC']] }] }),
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

        // 3. PREDICTIVE VELOCITY MATH (PROTOCOL X)
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress');
        const velocityDeltas = activeProjects.map(p => {
            const diaries = p.Diaries || [];
            if (diaries.length < 3) return { current: 1.0, drift: 0 };
            const recent = parseFloat(diaries[0].totalCost) || 0;
            const mid = parseFloat(diaries[1].totalCost) || 0;
            const prev = parseFloat(diaries[2].totalCost) || 0;
            
            const currentAccel = recent / (mid || 1);
            const prevAccel = mid / (prev || 1);
            return { current: currentAccel, drift: currentAccel - prevAccel };
        });

        const avgAccel = velocityDeltas.reduce((a,b) => a + b.current, 0) / (velocityDeltas.length || 1);
        const avgDrift = velocityDeltas.reduce((a,b) => a + b.drift, 0) / (velocityDeltas.length || 1);

        // 4. RESOURCE CONTENTION (BOTTLENECK ANALYSIS)
        const staffAssignments = {};
        allocations.forEach(a => {
            if (a.resourceType === 'staff') {
                staffAssignments[a.resourceId] = (staffAssignments[a.resourceId] || 0) + 1;
            }
        });
        const overAllocatedStaff = Object.values(staffAssignments).filter(count => count > 1).length;
        const contentionIndex = staff.length > 0 ? (overAllocatedStaff / staff.length) : 0;

        // 5. CLIENT HEALTH MATRIX
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

        // 6. SENTIMENT & FRICTION SCAN
        const frictionKeywords = ['delayed', 'broken', 'missing', 'wait', 'rework', 'slow', 'accident', 'issue', 'dispute'];
        const recentDiaryNotes = (await Diary.findAll({ limit: 50, attributes: ['notes'] }))
            .map(d => d.notes?.toLowerCase() || '')
            .join(' ');
        const frictionCount = frictionKeywords.filter(k => recentDiaryNotes.includes(k)).length;

        // 7. RESOURCE & MATERIAL INTELLIGENCE
        const staffProfiles = staff.map(s => ({ name: s.name, role: s.role, skills: s.skillTags }));
        
        // Analyze common materials from the Nodes table
        const topMaterials = await Node.findAll({ 
            where: { category: 'material' },
            limit: 10,
            order: [['pricePerUnit', 'DESC']]
        });

        // 8. DEEP DIARY ANALYSIS (SITE FEEDBACK)
        const recentDiaries = await Diary.findAll({ 
            limit: 20, 
            order: [['date', 'DESC']],
            attributes: ['notes', 'totalCost', 'totalRevenue', 'date']
        });
        
        const siteInsights = recentDiaries.map(d => d.notes).filter(Boolean).slice(0, 10);

        // 9. NEURAL CORTEX UPGRADE (SELF-CORRECTING INTELLIGENCE)
        // 9a. Estimation Bias (Variance between Quote vs Actuals)
        let estimationBias = 0;
        let biasDirection = 'NEUTRAL';
        const completedProjects = projects.filter(p => p.status === 'completed');
        
        if (completedProjects.length > 0) {
            let totalQuoteVariance = 0;
            let projectCount = 0;

            for (const p of completedProjects) {
                // Sum all approved quotes for this project
                const projectQuotes = await Quote.sum('totalCost', { where: { projectId: p.id, status: 'approved' } }) || 0;
                // Sum all diary costs for this project
                const projectActuals = await Diary.sum('totalCost', { where: { projectId: p.id } }) || 0;

                if (projectQuotes > 0) {
                    const variance = (projectActuals - projectQuotes) / projectQuotes;
                    totalQuoteVariance += variance;
                    projectCount++;
                }
            }

            if (projectCount > 0) {
                estimationBias = (totalQuoteVariance / projectCount);
                biasDirection = estimationBias > 0.05 ? 'UNDER_ESTIMATING' : (estimationBias < -0.05 ? 'OVER_ESTIMATING' : 'ACCURATE');
            }
        }

        // 9b. Association Matrix (What items go together?)
        // Scan last 50 approved quotes to find frequent pairs
        const associationRules = [];
        const recentQuotes = await Quote.findAll({ 
            where: { status: 'approved' }, 
            limit: 50, 
            order: [['createdAt', 'DESC']],
            attributes: ['nodes']
        });

        const itemPairs = {};
        recentQuotes.forEach(q => {
            const nodes = q.nodes || [];
            // Extract item names (simplified for performance)
            const items = nodes
                .filter(n => n.data && n.data.label)
                .map(n => n.data.label);
            
            // Generate unique pairs
            for (let i = 0; i < items.length; i++) {
                for (let j = i + 1; j < items.length; j++) {
                    const pair = [items[i], items[j]].sort().join('::');
                    itemPairs[pair] = (itemPairs[pair] || 0) + 1;
                }
            }
        });

        // Convert pairs to rules (Threshold: appear together in > 20% of quotes)
        Object.entries(itemPairs).forEach(([pair, count]) => {
            if (count > (recentQuotes.length * 0.2)) {
                const [itemA, itemB] = pair.split('::');
                associationRules.push({ itemA, itemB, confidence: (count / recentQuotes.length).toFixed(2) });
            }
        });

        // 9c. RESOURCE TEMPORAL PRESSURE (Scheduling Awareness)
        // Look ahead 14 days to see who is booked
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        
        const futureAllocations = await Allocation.findAll({
            where: {
                startDate: { [Op.gte]: new Date() },
                endDate: { [Op.lte]: twoWeeksFromNow },
                status: 'active'
            }
        });

        const resourceLoad = {}; // { staffId: daysBooked }
        futureAllocations.forEach(a => {
            if (a.resourceType === 'staff') {
                const start = new Date(a.startDate);
                const end = new Date(a.endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                resourceLoad[a.resourceId] = (resourceLoad[a.resourceId] || 0) + days;
            }
        });

        const heavyLoadThreshold = 10; // If booked > 10 days in next 14 days, they are "CRITICAL"
        const criticalStaff = staff.filter(s => (resourceLoad[s.id] || 0) >= heavyLoadThreshold)
                                   .map(s => s.name);
        
        const availableCrew = staff.filter(s => (resourceLoad[s.id] || 0) < 5) // Booked < 5 days is "OPEN"
                                   .map(s => `${s.name} (${s.role})`);

        // 9d. CLIENT GENOME (Financial Personality)
        // Analyze payment velocity and friction per client
        const clientGenome = {};
        for (const c of clients) {
            const clientInvoices = invoices.filter(i => i.clientId === c.id && i.status === 'paid');
            let avgPayDays = 0;
            if (clientInvoices.length > 0) {
                const totalDays = clientInvoices.reduce((sum, inv) => {
                    const sent = new Date(inv.createdAt);
                    const paid = new Date(inv.updatedAt); // Assuming updatedAt is pay date for 'paid' status
                    return sum + Math.max(0, (paid - sent) / (1000 * 60 * 60 * 24));
                }, 0);
                avgPayDays = Math.round(totalDays / clientInvoices.length);
            }
            
            // Friction: Do they have many rejected quotes?
            const rejectedQuotes = await Quote.count({ where: { clientId: c.id, status: 'rejected' } });
            
            if (avgPayDays > 0 || rejectedQuotes > 0) {
                clientGenome[c.id] = { 
                    name: c.name, 
                    avgPayDays, 
                    frictionScore: rejectedQuotes,
                    rating: avgPayDays > 30 ? 'SLOW_PAYER' : (avgPayDays < 7 ? 'INSTANT_PAYER' : 'STANDARD')
                };
            }
        }

        // 9e. FATIGUE METRICS (Safety Prediction)
        // Who has worked too many days in a row?
        const fatigueRisk = [];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Fetch allocations from the last 7 days
        const recentAllocations = await Allocation.findAll({
            where: {
                endDate: { [Op.gte]: oneWeekAgo },
                resourceType: 'staff'
            }
        });
        
        const consecutiveDays = {};
        recentAllocations.forEach(a => {
            const days = Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            consecutiveDays[a.resourceId] = (consecutiveDays[a.resourceId] || 0) + days;
        });

        staff.forEach(s => {
            const worked = consecutiveDays[s.id] || 0;
            if (worked > 6) {
                fatigueRisk.push(`${s.name} (${worked} days straight)`);
            }
        });

        return {
            mesh: {
                integrity: (1 - contentionIndex).toFixed(3),
                nodes: nodes + staff.length + equip + projects.length,
                resourceContentionIndex: contentionIndex.toFixed(2),
                institutionalEfficiency: (totalQuoted > 0 ? (totalInvoiced / totalQuoted) : 1.0).toFixed(2),
                burnAcceleration: avgAccel.toFixed(2),
                velocityDrift: avgDrift.toFixed(3),
                frictionIndex: (frictionCount / 50).toFixed(2),
                status: avgAccel > 1.1 ? 'VOLATILE' : 'STABLE'
            },
            cortex: {
                estimationBias: (estimationBias * 100).toFixed(1) + '%',
                biasDirection: biasDirection,
                associationRules: associationRules.slice(0, 10),
                temporalPressure: {
                    criticalStaff: criticalStaff,
                    availableCrew: availableCrew.slice(0, 5),
                    loadIndex: (Object.keys(resourceLoad).length / (staff.length || 1)).toFixed(2)
                },
                clientGenome: Object.values(clientGenome).filter(c => c.rating !== 'STANDARD').slice(0, 5), // Only show notable clients
                fatigueRisk: fatigueRisk
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
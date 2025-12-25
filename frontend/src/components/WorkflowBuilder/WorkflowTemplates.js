export const WORKFLOW_TEMPLATES = {
    // --- 1. LUXURY RESIDENCE MASTER LATTICE ---
    'res_new_build': {
        nodes: [
            { id: 'start', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Asset Architecture: New Build', config: { mode: 'new', projectName: 'Luxury Residence Alpha' } } },
            { id: 'client', type: 'clientNode', position: { x: 400, y: 150 }, data: { label: 'Lead Architect CRM Sync', config: { clientName: 'Billionaire Investor', tier: 'VIP' } } },
            { id: 'survey', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Topographical Drone Survey', assignee: 'Digital Site Surveyor' } },
            { id: 'soil', type: 'taskNode', position: { x: 650, y: 300 }, data: { label: 'Geotechnical Soil Scan', description: 'Core sampling for foundation stability validation.' } },
            { id: 'map', type: 'mapNode', position: { x: 400, y: 450 }, data: { label: 'Site Geofence Anchor', config: { locationName: 'Lot 102 Crystal Cove', radius: 80 } } },
            { id: 'safety', type: 'safetyNode', position: { x: 400, y: 600 }, data: { label: 'HSE Compliance Vault', config: { template: 'Site Induction', riskLevel: 'High' } } },
            { id: 'logic_permit', type: 'decision', position: { x: 400, y: 750 }, data: { label: 'Gov Permit Authorized?', config: { variable: 'quality', operator: '==', threshold: 'approved' } } },
            
            // FALSE BRANCH (Regulatory Friction)
            { id: 'delay_gov', type: 'delayNode', position: { x: 700, y: 900 }, data: { label: 'Planning Appeals Wait', config: { duration: 336, type: 'Approval' } } },
            { id: 'diary_gov', type: 'diaryNode', position: { x: 700, y: 1050 }, data: { label: 'Log Regulatory Friction', config: { logType: 'General' } } },
            
            // TRUE BRANCH (Execution Lattice)
            { id: 'fleet', type: 'resourceNode', position: { x: 100, y: 900 }, data: { label: 'Civil Fleet Deployment', config: { resourceType: 'Excavator', quantity: 4 } } },
            { id: 'forensic', type: 'forensicNode', position: { x: 100, y: 1050 }, data: { label: 'Financial Drift Audit', config: { category: 'Financial Risk', sensitivity: 'High' } } },
            { id: 'variation', type: 'variationNode', position: { x: -150, y: 1050 }, data: { label: 'Ground Strata Adjustment', config: { variationAmount: 15000, variationType: 'Credit', reason: 'Unforeseen Rock' } } },
            { id: 'milestone_slab', type: 'milestone', position: { x: 100, y: 1200 }, data: { label: 'Structural Foundation Slab', config: { progressImpact: 20, requirement: 'all_tasks' } } },
            { id: 'invoice_1', type: 'invoiceNode', position: { x: 100, y: 1350 }, data: { label: 'Foundation Progress Claim', config: { amount: 120000, status: 'DRAFT' } } },
            { id: 'wormhole_frame', type: 'wormholeNode', position: { x: 400, y: 1500 }, data: { label: 'Warp to Frame Structure', config: { targetWorkflow: 'Residential Frame Stage' } } }
        ],
        edges: [
            { id: 'e1', source: 'start', target: 'client', type: 'custom', animated: true },
            { id: 'e2', source: 'client', target: 'survey', type: 'custom', animated: true },
            { id: 'e2b', source: 'survey', target: 'soil', type: 'custom' },
            { id: 'e3', source: 'survey', target: 'map', type: 'custom', animated: true },
            { id: 'e4', source: 'map', target: 'safety', type: 'custom', animated: true },
            { id: 'e5', source: 'safety', target: 'logic_permit', type: 'custom' },
            { id: 'e6_f', source: 'logic_permit', target: 'delay_gov', sourceHandle: 'false', type: 'custom' },
            { id: 'e7_f', source: 'delay_gov', target: 'diary_gov', type: 'custom' },
            { id: 'e8_f', source: 'diary_gov', target: 'logic_permit', type: 'custom', animated: true },
            { id: 'e6_t', source: 'logic_permit', target: 'fleet', sourceHandle: 'true', type: 'custom' },
            { id: 'e7_t', source: 'fleet', target: 'forensic', type: 'custom' },
            { id: 'e7_tb', source: 'fleet', target: 'variation', type: 'custom', animated: true },
            { id: 'e8_t', source: 'forensic', target: 'milestone_slab', type: 'custom' },
            { id: 'e9_t', source: 'milestone_slab', target: 'invoice_1', type: 'custom' },
            { id: 'e10_t', source: 'invoice_1', target: 'wormhole_frame', type: 'custom', animated: true }
        ]
    },

    // --- 2. HAZARDOUS INDUSTRIAL DECONTAMINATION ---
    'hazmat_asbestos': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Industrial Remediation Hub', config: { mode: 'new', projectName: 'Project Biohazard' } } },
            { id: '2', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Atmospheric Hot Zone', config: { radius: 150, lat: -37.8, lng: 144.9 } } },
            { id: '3', type: 'safetyNode', position: { x: 400, y: 300 }, data: { label: 'Class A Asbestos SWMS', config: { template: 'Asbestos Removal', riskLevel: 'Critical' } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Negative Pressure Setup', assignee: 'HSE Specialist' } },
            { id: '5', type: 'resourceNode', position: { x: 150, y: 450 }, data: { label: 'HEPA Extraction Fleet', config: { resourceType: 'Safety Equipment', quantity: 6 } } },
            { id: '6', type: 'diaryNode', position: { x: 650, y: 450 }, data: { label: 'Live Atmospheric Air Log', config: { logType: 'Incident' } } },
            { id: '7', type: 'decision', position: { x: 400, y: 600 }, data: { label: 'Air Quality Nominal?', config: { variable: 'quality', operator: '==', threshold: 'safe' } } },
            
            // FALSE BRANCH (Containment Failure)
            { id: '8', type: 'delayNode', position: { x: 700, y: 750 }, data: { label: 'Emergency Evac Hold', config: { duration: 48, type: 'Standard' } } },
            { id: '9', type: 'forensicNode', position: { x: 700, y: 900 }, data: { label: 'Containment Failure Audit', config: { category: 'Safety Anomaly', sensitivity: 'Forensic' } } },
            
            // TRUE BRANCH (Cleansing Protocol)
            { id: '10', type: 'taskNode', position: { x: 100, y: 750 }, data: { label: 'Mechanical Removal Phase', status: 'pending' } },
            { id: '11', type: 'approval', position: { x: 100, y: 900 }, data: { label: 'Gov Hygienist sign-off', config: { signatures: 2, role: 'Safety Officer' } } },
            { id: '12', type: 'milestone', position: { x: 400, y: 1050 }, data: { label: 'Site Safety Re-activation', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e4-6', source: '4', target: '6', type: 'custom', animated: true },
            { id: 'e4-7', source: '4', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', sourceHandle: 'false', type: 'custom' },
            { id: 'e8-9', source: '8', target: '9', type: 'custom', animated: true },
            { id: 'e9-7', source: '9', target: '7', type: 'custom', animated: true },
            { id: 'e7-10', source: '7', target: '10', sourceHandle: 'true', type: 'custom' },
            { id: 'e10-11', source: '10', target: '11', type: 'custom' },
            { id: 'e11-12', source: '11', target: '12', type: 'custom', animated: true }
        ]
    },

    // --- 3. VERTICAL SKY-SCRAPER CONCRETE CYCLE ---
    'comm_highrise_concrete': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Tower Core Vertical Ops', config: { mode: 'established', projectId: 'TOWER-A' } } },
            { id: '2', type: 'quoteNode', position: { x: 400, y: 150 }, data: { label: 'Bulk Structural Supply', config: { value: 250000, projectName: 'Tower Core' } } },
            { id: '3', type: 'resourceNode', position: { x: 400, y: 300 }, data: { label: 'L12 Steelfixer Unit', config: { resourceType: 'General Staff', quantity: 12 } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Formwork & Steel Lattice', assignee: 'Site Engineer' } },
            { id: '5', type: 'safetyNode', position: { x: 650, y: 450 }, data: { label: 'Pre-Pour Verification', config: { template: 'Daily Pre-Start', riskLevel: 'High' } } },
            { id: '6', type: 'approval', position: { x: 400, y: 600 }, data: { label: 'Engineer Structural Auth', config: { signatures: 1, role: 'Project Manager' } } },
            { id: '7', type: 'resourceNode', position: { x: 400, y: 750 }, data: { label: 'High-Pressure Pump Fleet', config: { resourceType: 'Pump Truck', quantity: 2 } } },
            { id: '8', type: 'taskNode', position: { x: 400, y: 900 }, data: { label: 'Main Structural Pour', status: 'pending' } },
            { id: '9', type: 'delayNode', position: { x: 400, y: 1050 }, data: { label: 'Exothermic Curing Hold', config: { duration: 72, type: 'Curing' } } },
            { id: '10', type: 'variationNode', position: { x: 650, y: 900 }, data: { label: 'Weather Standby Claim', config: { variationAmount: 8500, variationType: 'Credit', reason: 'High Wind Hold' } } },
            { id: '11', type: 'invoiceNode', position: { x: 400, y: 1200 }, data: { label: 'L12 Vertical Claim', config: { amount: 185000, status: 'DRAFT' } } },
            { id: '12', type: 'milestone', position: { x: 400, y: 1350 }, data: { label: 'Core Integrity Certified', config: { progressImpact: 5, requirement: 'invoice_paid' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e4-6', source: '4', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom' }, { id: 'e8-9', source: '8', target: '9', type: 'custom' },
            { id: 'e8-10', source: '8', target: '10', type: 'custom', animated: true }, { id: 'e9-11', source: '9', target: '11', type: 'custom' },
            { id: 'e11-12', source: '11', target: '12', type: 'custom', animated: true }
        ]
    },

    // --- 4. CIVIL INFRASTRUCTURE WATER LINK ---
    'civil_pipeline': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Regional Water Lattice', config: { mode: 'new', projectName: 'Water Link V1' } } },
            { id: '2', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Underground Asset Sync', config: { locationName: 'Regional Zone Alpha', radius: 1000 } } },
            { id: '3', type: 'safetyNode', position: { x: 400, y: 300 }, data: { label: 'Critical Service SWMS', config: { template: 'High Risk SWMS', riskLevel: 'Critical' } } },
            { id: '4', type: 'forensicNode', position: { x: 400, y: 450 }, data: { label: 'Geotechnical Soil Scan', config: { category: 'Timeline Drift', sensitivity: 'High' } } },
            { id: '5', type: 'resourceNode', position: { x: 400, y: 600 }, data: { label: 'Excavation Armada', config: { resourceType: 'Excavator', quantity: 5 } } },
            { id: '6', type: 'decision', position: { x: 400, y: 750 }, data: { label: 'Hard Strata Obstruction?', config: { variable: 'time', operator: '>', threshold: '48' } } },
            { id: '7', type: 'variationNode', position: { x: 650, y: 900 }, data: { label: 'Rock-Hammer Surcharge', config: { variationAmount: 25000, variationType: 'Credit', reason: 'Unforeseen Rock' } } },
            { id: '8', type: 'taskNode', position: { x: 150, y: 900 }, data: { label: 'Standard Conduit Placement', status: 'pending' } },
            { id: '9', type: 'diaryNode', position: { x: 400, y: 1050 }, data: { label: 'Daily Civil Telemetry', config: { logType: 'General' } } },
            { id: '10', type: 'milestone', position: { x: 400, y: 1200 }, data: { label: 'Pressure-Test Acceptance', config: { progressImpact: 85, requirement: 'manual' } } },
            { id: '11', type: 'invoiceNode', position: { x: 400, y: 1350 }, data: { label: 'Civil Infrastructure Claim', config: { amount: 450000, status: 'SENT' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom', animated: true }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, 
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'true', type: 'custom', animated: true },
            { id: 'e6-8', source: '6', target: '8', sourceHandle: 'false', type: 'custom' },
            { id: 'e7-9', source: '7', target: '9', type: 'custom' }, { id: 'e8-9', source: '8', target: '9', type: 'custom' },
            { id: 'e9-10', source: '9', target: '10', type: 'custom' }, { id: 'e10-11', source: '10', target: '11', type: 'custom', animated: true }
        ]
    },

    // --- 5. OFFICE TENANCY RE-ENGINEERING ---
    'comm_fitout': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Tenancy Release Signal', config: { filterVar: 'priority', filterOp: '==', filterVal: 'High' } } },
            { id: '2', type: 'projectNode', position: { x: 400, y: 150 }, data: { label: 'Executive Tenancy 402', config: { mode: 'new', projectName: 'Office 402' } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Interior Shell Strip', assignee: 'Site Supervisor' } },
            { id: '4', type: 'resourceNode', position: { x: 400, y: 450 }, data: { label: 'HVAC & MEP Fleet', config: { resourceType: 'General Staff', quantity: 6 } } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Partition & Data Lattice', status: 'pending' } },
            { id: '6', type: 'decision', position: { x: 400, y: 750 }, data: { label: 'High-Spec AV Upgrade?', config: { variable: 'budget', operator: '>', threshold: '5000' } } },
            { id: '7', type: 'quoteNode', position: { x: 650, y: 900 }, data: { label: 'Neural AV Quote', config: { value: 15000, projectName: 'Office 402' } } },
            { id: '8', type: 'taskNode', position: { x: 150, y: 900 }, data: { label: 'Architectural Glazing', status: 'pending' } },
            { id: '9', type: 'milestone', position: { x: 400, y: 1050 }, data: { label: 'Shell Readiness Reached', config: { progressImpact: 95 } } },
            { id: '10', type: 'invoiceNode', position: { x: 400, y: 1200 }, data: { label: 'Architectural Completion Claim', config: { amount: 125000, status: 'DRAFT' } } },
            { id: '11', type: 'output', position: { x: 400, y: 1350 }, data: { label: 'Tenant Integration Live', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' },
            { id: 'e6-7', source: '6', target: '7', sourceHandle: 'true', type: 'custom', animated: true },
            { id: 'e6-8', source: '6', target: '8', sourceHandle: 'false', type: 'custom' },
            { id: 'e7-9', source: '7', target: '9', type: 'custom' }, { id: 'e8-9', source: '8', target: '9', type: 'custom' },
            { id: 'e9-10', source: '9', target: '10', type: 'custom' }, { id: 'e10-11', source: '10', target: '11', type: 'custom', animated: true }
        ]
    },

    // --- 6. CRITICAL SAFETY ANOMALY RESPONSE ---
    'safety_incident': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Critical Anomaly Detected', config: { filterVar: 'type', filterOp: '==', filterVal: 'Critical' } } },
            { id: '2', type: 'diaryNode', position: { x: 400, y: 150 }, data: { label: 'Forensic Site Evidence', config: { logType: 'Incident' } } },
            { id: '3', type: 'mapNode', position: { x: 400, y: 300 }, data: { label: 'Lattice Exclusion Zone', config: { radius: 50 } } },
            { id: '4', type: 'forensicNode', position: { x: 400, y: 450 }, data: { label: 'Root Cause Simulation', config: { category: 'Safety Anomaly', sensitivity: 'Forensic' } } },
            { id: '5', type: 'decision', position: { x: 400, y: 600 }, data: { label: 'Structural Instability?', config: { variable: 'risk', operator: '==', threshold: 'Critical' } } },
            { id: '6', type: 'taskNode', position: { x: 650, y: 750 }, data: { label: 'Emergency Propping Unit', status: 'pending' } },
            { id: '7', type: 'approval', position: { x: 650, y: 900 }, data: { label: 'Director Hierarchy Auth', config: { signatures: 3, role: 'Project Manager' } } },
            { id: '8', type: 'taskNode', position: { x: 150, y: 750 }, data: { label: 'Regulatory HSE Reporting', status: 'pending' } },
            { id: '9', type: 'milestone', position: { x: 400, y: 1050 }, data: { label: 'Neural Safety Re-activation', config: { progressImpact: 0, requirement: 'manual' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom', animated: true }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', sourceHandle: 'true', type: 'custom' },
            { id: 'e5-8', source: '5', target: '8', sourceHandle: 'false', type: 'custom' },
            { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-9', source: '7', target: '9', type: 'custom' }, { id: 'e8-9', source: '8', target: '9', type: 'custom' }
        ]
    },

    // --- 7. GENESIS TENDER ARCHITECT ---
    'tender_preparation': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Major RFQ Signal Received', config: { filterVar: 'type', filterOp: '==', filterVal: 'Tender' } } },
            { id: '2', type: 'quoteNode', position: { x: 400, y: 150 }, data: { label: 'Genesis Estimation Lattice', config: { value: 0, projectName: 'Master Tender' } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Supply-Chain Procurement', status: 'pending' } },
            { id: '4', type: 'forensicNode', position: { x: 400, y: 450 }, data: { label: 'Margin Erosion Scan', config: { category: 'Financial Risk', sensitivity: 'High' } } },
            { id: '5', type: 'approval', position: { x: 400, y: 600 }, data: { label: 'Executive Value Lock', config: { signatures: 2, role: 'Project Manager' } } },
            { id: '6', type: 'taskNode', position: { x: 400, y: 750 }, data: { label: 'Digital Bid Deployment', status: 'pending' } },
            { id: '7', type: 'decision', position: { x: 400, y: 900 }, data: { label: 'Lattice Optimized & Won?', config: { variable: 'quality', operator: '==', threshold: 'won' } } },
            { id: '8', type: 'projectNode', position: { x: 150, y: 1050 }, data: { label: 'Initialize Live Project Hub', config: { mode: 'new', projectName: 'Won Project' } } },
            { id: '9', type: 'milestone', position: { x: 650, y: 1050 }, data: { label: 'Archive Architectural Brief', config: { progressImpact: 0, requirement: 'manual' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom', animated: true }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', sourceHandle: 'true', type: 'custom', animated: true },
            { id: 'e7-9', source: '7', target: '9', sourceHandle: 'false', type: 'custom' }
        ]
    },

    // --- 8. RENEWABLE SOLAR ARRAY DEPLOYMENT ---
    'solar_install': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'PV Site Integration Hub', config: { mode: 'new', projectName: 'Solar Array PV' } } },
            { id: '2', type: 'safetyNode', position: { x: 400, y: 150 }, data: { label: 'Height Safety SWMS Vault', config: { template: 'High Risk SWMS', riskLevel: 'High' } } },
            { id: '3', type: 'resourceNode', position: { x: 400, y: 300 }, data: { label: 'PV Installation Armada', config: { resourceType: 'General Staff', quantity: 4 } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Precision Racking Mounts', status: 'pending' } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Silicon Cell Integration', status: 'pending' } },
            { id: '6', type: 'taskNode', position: { x: 400, y: 750 }, data: { label: 'Inverter & Neural Grid Sync', status: 'pending' } },
            { id: '7', type: 'approval', position: { x: 400, y: 900 }, data: { label: 'Grid Interconnect Auth', config: { role: 'Safety Officer', signatures: 1 } } },
            { id: '8', type: 'invoiceNode', position: { x: 400, y: 1050 }, data: { label: 'Federal Energy Incentive Claim', config: { amount: 35000, status: 'DRAFT' } } },
            { id: '9', type: 'milestone', position: { x: 400, y: 1200 }, data: { label: 'Renewable Asset Operational', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom' }, { id: 'e8-9', source: '8', target: '9', type: 'custom', animated: true }
        ]
    },

    // --- 9. EMERGENCY GRID RESTORATION ---
    'emergency_repair': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Critical Grid Failure Signal', config: { filterVar: 'priority', filterOp: '==', filterVal: 'Critical' } } },
            { id: '2', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Fault Localization Anchor', config: { radius: 40 } } },
            { id: '3', type: 'resourceNode', position: { x: 400, y: 300 }, data: { label: 'Tactical Maintenance Unit', config: { resourceType: 'General Staff', quantity: 3 } } },
            { id: '4', type: 'safetyNode', position: { x: 400, y: 450 }, data: { label: 'Lockout/Tagout SWMS Vault', config: { template: 'High Risk SWMS', riskLevel: 'Critical' } } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Digital Grid Bypass', status: 'pending' } },
            { id: '6', type: 'delayNode', position: { x: 650, y: 600 }, data: { label: 'Capacitance Stabilize', config: { duration: 6, type: 'Standard' } } },
            { id: '7', type: 'taskNode', position: { x: 400, y: 750 }, data: { label: 'Core Structural Repair', status: 'pending' } },
            { id: '8', type: 'milestone', position: { x: 400, y: 900 }, data: { label: 'Regional Grid Synchronized', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom', animated: true }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom', animated: true }
        ]
    },

    // --- 10. NEURAL SITE WASTE LOGISTICS ---
    'waste_management': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Integrated Logistics Sync', config: { mode: 'established' } } },
            { id: '2', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Laydown Zone Boundary', config: { radius: 120 } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Asset Delivery Logic', assignee: 'Site Yardman' } },
            { id: '4', type: 'decision', position: { x: 400, y: 450 }, data: { label: 'Hazardous Payload Detected?', config: { variable: 'quality', operator: '==', threshold: 'hazmat' } } },
            { id: '5', type: 'safetyNode', position: { x: 650, y: 600 }, data: { label: 'Forensic Hazmat SWMS Lock', config: { template: 'Hazmat Handling', riskLevel: 'High' } } },
            { id: '6', type: 'resourceNode', position: { x: 150, y: 600 }, data: { label: 'Autonomous Tipper Fleet', config: { resourceType: 'Waste Bin', quantity: 2 } } },
            { id: '7', type: 'diaryNode', position: { x: 400, y: 750 }, data: { label: 'Tipping Data Aggregation', config: { logType: 'General' } } },
            { id: '8', type: 'invoiceNode', position: { x: 400, y: 900 }, data: { label: 'Carbon Offset Claim', config: { amount: 2500, status: 'DRAFT' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true', type: 'custom' },
            { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false', type: 'custom' },
            { id: 'e5-7', source: '5', target: '7', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom', animated: true }
        ]
    },
    // --- 11. INDUSTRIAL POOL MASTER LATTICE ---
    'pool_construction': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Sub-surface Pool Architecture', config: { mode: 'new', projectName: 'Inground Pool Asset' } } },
            { id: '2', type: 'resourceNode', position: { x: 400, y: 150 }, data: { label: 'Precision Strata Excavator', config: { resourceType: 'Excavator', quantity: 1 } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Lattice Shell Excavation', status: 'pending' } },
            { id: '4', type: 'decision', position: { x: 400, y: 450 }, data: { label: 'Unexpected Rock strata?', config: { variable: 'time', operator: '>', threshold: '12' } } },
            { id: '5', type: 'variationNode', position: { x: 650, y: 600 }, data: { label: 'Strata Extraction Premium', config: { variationAmount: 4500, variationType: 'Credit', reason: 'Unforeseen ground' } } },
            { id: '6', type: 'taskNode', position: { x: 150, y: 600 }, data: { label: 'Structural Steel Mesh', status: 'pending' } },
            { id: '7', type: 'safetyNode', position: { x: 400, y: 750 }, data: { label: 'Barrier Integrity Protocol', config: { template: 'Site Induction', riskLevel: 'High' } } },
            { id: '8', type: 'milestone', position: { x: 400, y: 900 }, data: { label: 'Hydro-Asset Practical Completion', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true', type: 'custom', animated: true },
            { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false', type: 'custom' },
            { id: 'e5-7', source: '5', target: '7', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom', animated: true }
        ]
    },
    // --- 12. ROOF ASSET REPLACEMENT MASTER ---
    'roof_replacement': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Storm Resilience Signal', config: { filterVar: 'type', filterOp: '==', filterVal: 'Insurance' } } },
            { id: '2', type: 'quoteNode', position: { x: 400, y: 150 }, data: { label: 'Structural Shell Estimation', config: { value: 22000, projectName: 'Roof Restoration' } } },
            { id: '3', type: 'safetyNode', position: { x: 400, y: 300 }, data: { label: 'Vertical Fall Protocol Lock', config: { template: 'High Risk SWMS', riskLevel: 'Critical' } } },
            { id: '4', type: 'resourceNode', position: { x: 400, y: 450 }, data: { label: 'Access & Edge Protection', config: { resourceType: 'Scaffold', quantity: 1 } } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Core Asset Stripping', status: 'pending' } },
            { id: '6', type: 'diaryNode', position: { x: 650, y: 600 }, data: { label: 'Thermal Integration Log', config: { logType: 'General' } } },
            { id: '7', type: 'taskNode', position: { x: 400, y: 750 }, data: { label: 'Colorbond Steel Integration', status: 'pending' } },
            { id: '8', type: 'invoiceNode', position: { x: 400, y: 900 }, data: { label: 'Final Retention Release', config: { amount: 22000, status: 'DRAFT' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom', animated: true }, { id: 'e5-7', source: '5', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom', animated: true }
        ]
    },
    // --- 13. MASTER SITE DEMOBILIZATION ARCHITECT ---
    'site_demobilization': {
        nodes: [
            { id: '1', type: 'milestone', position: { x: 400, y: 0 }, data: { label: 'Asset Handover Point', status: 'completed' } },
            { id: '2', type: 'resourceNode', position: { x: 400, y: 150 }, data: { label: 'Neural Fleet Recall', config: { resourceType: 'General Staff', quantity: 3 } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Infrastructure Extraction', assignee: 'Project Lead' } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Forensic Site Scrub', status: 'pending' } },
            { id: '5', type: 'forensicNode', position: { x: 400, y: 600 }, data: { label: 'Final Profit Variance Audit', config: { category: 'Financial Risk', sensitivity: 'Forensic' } } },
            { id: '6', type: 'output', position: { x: 400, y: 750 }, data: { label: 'Operational Lattice Closed', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom', animated: true }
        ]
    },
    // --- 14. VERTICAL SCAFFOLD ARCHITECT ---
    'scaffold_erection': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Vertical Access Signal', config: { filterVar: 'priority', filterOp: '==', filterVal: 'High' } } },
            { id: '2', type: 'safetyNode', position: { x: 400, y: 150 }, data: { label: 'Elevation Safety SWMS Lock', config: { template: 'High Risk SWMS', riskLevel: 'Critical' } } },
            { id: '3', type: 'resourceNode', position: { x: 400, y: 300 }, data: { label: 'Lattice Support Unit', config: { resourceType: 'General Staff', quantity: 5 } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Base Architectural Layer', status: 'pending' } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Vertical Lift Integration', status: 'pending' } },
            { id: '6', type: 'approval', position: { x: 400, y: 750 }, data: { label: 'Load-Bearing Certificate', config: { role: 'Safety Officer', signatures: 1 } } },
            { id: '7', type: 'milestone', position: { x: 400, y: 900 }, data: { label: 'Lattice Safe for Sky-Ops', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom', animated: true }
        ]
    },
    // --- 15. KITCHEN RENOVATION MASTER CIRCUIT ---
    'renovation_kitchen': {
        nodes: [
            { id: '1', type: 'clientNode', position: { x: 400, y: 0 }, data: { label: 'Homeowner Neural Sync', config: { tier: 'Standard' } } },
            { id: '2', type: 'projectNode', position: { x: 400, y: 150 }, data: { label: 'Internal Phase 1 Architect', config: { mode: 'new', projectName: 'Kitchen Reno' } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Utility Decoupling', assignee: 'Master Plumber' } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Internal Shell Demolition', status: 'pending' } },
            { id: '5', type: 'resourceNode', position: { x: 400, y: 600 }, data: { label: 'Fit-out Support Unit', config: { resourceType: 'General Staff', quantity: 2 } } },
            { id: '6', type: 'milestone', position: { x: 400, y: 750 }, data: { label: 'Stone Template Verification', config: { progressImpact: 60 } } },
            { id: '7', type: 'invoiceNode', position: { x: 400, y: 900 }, data: { label: 'Asset Progression Claim', config: { amount: 8500, status: 'DRAFT' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom', animated: true }
        ]
    },
    // --- 16. ROAD INFRASTRUCTURE REMEDIATION ---
    'road_infrastructure': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Regional Asset Failure Signal', config: { filterVar: 'priority', filterOp: '==', filterVal: 'High' } } },
            { id: '2', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Civil Remediation Zone', config: { radius: 250 } } },
            { id: '3', type: 'safetyNode', position: { x: 400, y: 300 }, data: { label: 'Traffic Control SWMS Vault', config: { template: 'Site Induction', riskLevel: 'Critical' } } },
            { id: '4', type: 'resourceNode', position: { x: 400, y: 450 }, data: { label: 'Bituminous Paving Armada', config: { resourceType: 'General Staff', quantity: 6 } } },
            { id: '5', type: 'taskNode', position: { x: 400, y: 600 }, data: { label: 'Surface Milling Logic', status: 'pending' } },
            { id: '6', type: 'taskNode', position: { x: 400, y: 750 }, data: { label: 'Hot-Mix Integration', status: 'pending' } },
            { id: '7', type: 'milestone', position: { x: 400, y: 900 }, data: { label: 'Asset Surface Restored', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }, { id: 'e6-7', source: '6', target: '7', type: 'custom', animated: true }
        ]
    },
    // --- 17. STRATEGIC MATERIAL PROCUREMENT ---
    'major_procurement': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Supply Depletion Threshold', config: { filterVar: 'amount', filterOp: '<', filterVal: '5' } } },
            { id: '2', type: 'quoteNode', position: { x: 400, y: 150 }, data: { label: 'Multi-Vendor Genesis Quote', config: { value: 0, projectName: 'Bulk Stock' } } },
            { id: '3', type: 'approval', position: { x: 400, y: 300 }, data: { label: 'Commercial Value Authorization', config: { role: 'Project Manager', signatures: 1 } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Digital Purchase Order Arc', status: 'pending' } },
            { id: '5', type: 'forensicNode', position: { x: 400, y: 600 }, data: { label: 'Financial Variance Scan', config: { category: 'Financial Risk', sensitivity: 'High' } } },
            { id: '6', type: 'milestone', position: { x: 400, y: 750 }, data: { label: 'Lattice Asset Synchronized', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom', animated: true },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }
        ]
    },
    // --- 18. MASTER DEFECT REMEDIATION LOOP ---
    'qa_defect_loop': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Handover Protocol Sync', status: 'completed' } },
            { id: '2', type: 'taskNode', position: { x: 400, y: 150 }, data: { label: 'Site Lattice Diagnostics', assignee: 'QA Engineer' } },
            { id: '3', type: 'decision', position: { x: 400, y: 300 }, data: { label: 'Anomalies Identified?', config: { variable: 'quality', operator: '>', threshold: '0' } } },
            { id: '4', type: 'diaryNode', position: { x: 650, y: 450 }, data: { label: 'Forensic Defect Register', config: { logType: 'General' } } },
            { id: '5', type: 'taskNode', position: { x: 650, y: 600 }, data: { label: 'Sub-system Rectification', status: 'pending' } },
            { id: '6', type: 'milestone', position: { x: 150, y: 450 }, data: { label: 'Practical Completion Lock', config: { progressImpact: 100 } } },
            { id: '7', type: 'invoiceNode', position: { x: 150, y: 600 }, data: { label: 'Asset Retention Release', config: { amount: 25000, status: 'DRAFT' } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', type: 'custom', animated: true },
            { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-2', source: '5', target: '2', type: 'custom', animated: true },
            { id: 'e6-7', source: '6', target: '7', type: 'custom', animated: true }
        ]
    },
    // --- 19. STRUCTURAL DECON ARCHITECT ---
    'structural_decon': {
        nodes: [
            { id: '1', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Structural Asset Extraction', config: { mode: 'new', projectName: 'Demo Alpha' } } },
            { id: '2', type: 'safetyNode', position: { x: 400, y: 150 }, data: { label: 'Terminal SWMS Compliance', config: { template: 'Asbestos Removal', riskLevel: 'Critical' } } },
            { id: '3', type: 'resourceNode', position: { x: 400, y: 300 }, data: { label: 'Heavy Deconstruction Fleet', config: { resourceType: 'Pump Truck', quantity: 1 } } },
            { id: '4', type: 'taskNode', position: { x: 400, y: 450 }, data: { label: 'Mechanical Asset Dismantle', status: 'pending' } },
            { id: '5', type: 'diaryNode', position: { x: 650, y: 450 }, data: { label: 'Tipping Stream Analytics', config: { logType: 'General' } } },
            { id: '6', type: 'milestone', position: { x: 400, y: 600 }, data: { label: 'Sub-surface Scrape Complete', config: { progressImpact: 100 } } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom', animated: true },
            { id: 'e4-6', source: '4', target: '6', type: 'custom', animated: true }
        ]
    },
    // --- 20. ENTERPRISE PERSONNEL ONBOARDING ---
    'employee_onboarding': {
        nodes: [
            { id: '1', type: 'trigger', position: { x: 400, y: 0 }, data: { label: 'Digital Contract Executed', config: { filterVar: 'type', filterOp: '==', filterVal: 'Hires' } } },
            { id: '2', type: 'safetyNode', position: { x: 400, y: 150 }, data: { label: 'Global Site Neural Induction', config: { template: 'Site Induction', riskLevel: 'Low' } } },
            { id: '3', type: 'taskNode', position: { x: 400, y: 300 }, data: { label: 'Tactical Uniform Issuance', assignee: 'Operations Lead' } },
            { id: '4', type: 'resourceNode', position: { x: 400, y: 450 }, data: { label: 'Mobility Asset Allocation', config: { resourceType: 'General Staff', quantity: 1 } } },
            { id: '5', type: 'approval', position: { x: 400, y: 600 }, data: { label: 'Executive Access Auth', config: { role: 'Project Manager', signatures: 1 } } },
            { id: '6', type: 'output', position: { x: 400, y: 750 }, data: { label: 'Personnel Live in Ecosystem', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true }, { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' }, { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom', animated: true }
        ]
    },
    // --- 21. MEGA INFRASTRUCTURE FOUNDATION (LEVEL 5) ---
    'mega_infrastructure': {
        nodes: [
            { id: 'start', type: 'projectNode', position: { x: 400, y: 0 }, data: { label: 'Lattice Alpha: Mega Foundation', config: { mode: 'new', projectName: 'Interstate Hub' } } },
            { id: 'map', type: 'mapNode', position: { x: 400, y: 150 }, data: { label: 'Sector 7 Geofence', config: { locationName: 'Main Terminal', radius: 500 } } },
            { id: 'forensic_1', type: 'forensicNode', position: { x: 400, y: 300 }, data: { label: 'Pre-Genesis Drift Audit', config: { category: 'Financial Risk', sensitivity: 'Forensic' } } },
            
            // RICH TASK NODES
            { id: 'task_prep', type: 'taskNode', position: { x: 150, y: 450 }, data: { label: 'Site Cleansing', config: { taskType: 'Preparation', zone: 'Sector 7', plannedHours: 48, crewSize: 6 } } },
            { id: 'task_piles', type: 'taskNode', position: { x: 650, y: 450 }, data: { label: 'Structural Piling', config: { taskType: 'Installation', zone: 'North Pier', plannedHours: 120, crewSize: 12 } } },
            
            { id: 'logic_soil', type: 'decision', position: { x: 400, y: 600 }, data: { label: 'Strata Density Nominal?', config: { variable: 'quality', operator: '>', threshold: '80' } } },
            
            // RECOVERY BRANCH
            { id: 'var_soil', type: 'variationNode', position: { x: 700, y: 750 }, data: { label: 'Strata Remediation Claim', config: { variationAmount: 85000, variationType: 'Credit', reason: 'Unforeseen Deep Strata' } } },
            { id: 'task_extra', type: 'taskNode', position: { x: 700, y: 900 }, data: { label: 'Reinforced Grouting', config: { taskType: 'Installation', zone: 'Pier 4', plannedHours: 72, crewSize: 4 } } },
            
            // MAIN PATH
            { id: 'milestone_ready', type: 'milestone', position: { x: 100, y: 750 }, data: { label: 'Foundation Integrity Lock', config: { progressImpact: 40 } } },
            { id: 'invoice_1', type: 'invoiceNode', position: { x: 100, y: 900 }, data: { label: 'Foundation Genesis Claim', config: { amount: 1500000, status: 'DRAFT' } } },
            { id: 'wormhole_final', type: 'wormholeNode', position: { x: 400, y: 1050 }, data: { label: 'Warp to Superstructure', config: { targetWorkflow: 'Mega Hub Phase 2' } } }
        ],
        edges: [
            { id: 'e1', source: 'start', target: 'map', type: 'custom', animated: true },
            { id: 'e2', source: 'map', target: 'forensic_1', type: 'custom', animated: true },
            { id: 'e3a', source: 'forensic_1', target: 'task_prep', type: 'custom' },
            { id: 'e3b', source: 'forensic_1', target: 'task_piles', type: 'custom' },
            { id: 'e4a', source: 'task_prep', target: 'logic_soil', type: 'custom' },
            { id: 'e4b', source: 'task_piles', target: 'logic_soil', type: 'custom' },
            { id: 'e5_f', source: 'logic_soil', target: 'var_soil', sourceHandle: 'false', type: 'custom', animated: true },
            { id: 'e6_f', source: 'var_soil', target: 'task_extra', type: 'custom' },
            { id: 'e7_f', source: 'task_extra', target: 'milestone_ready', type: 'custom', animated: true },
            { id: 'e5_t', source: 'logic_soil', target: 'milestone_ready', sourceHandle: 'true', type: 'custom' },
            { id: 'e8', source: 'milestone_ready', target: 'invoice_1', type: 'custom' },
            { id: 'e9', source: 'invoice_1', target: 'wormhole_final', type: 'custom', animated: true }
        ]
    }
};
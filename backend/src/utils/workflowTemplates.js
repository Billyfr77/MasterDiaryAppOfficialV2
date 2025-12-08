// Comprehensive Library of Construction & Management Workflow Templates

const templates = {
    construction: {
        title: "Residential New Build (Full)",
        description: "End-to-end process from site prep to handover for a standard residential home.",
        nodes: [
            { id: '1', type: 'input', data: { label: 'Site Possession', status: 'completed' }, position: { x: 250, y: 0 } },
            { id: '2', type: 'default', data: { label: 'Site Fencing & Signage', status: 'pending' }, position: { x: 250, y: 100 } },
            { id: '3', type: 'milestone', data: { label: 'Slab Down', status: 'pending' }, position: { x: 250, y: 200 } },
            { id: '4', type: 'default', data: { label: 'Frame Stage', status: 'pending' }, position: { x: 250, y: 300 } },
            { id: '5', type: 'approval', data: { label: 'Frame Inspection', status: 'pending' }, position: { x: 250, y: 400 } },
            { id: '6', type: 'default', data: { label: 'Roofing & Gutters', status: 'pending' }, position: { x: 100, y: 500 } },
            { id: '7', type: 'default', data: { label: 'Windows & Doors', status: 'pending' }, position: { x: 400, y: 500 } },
            { id: '8', type: 'milestone', data: { label: 'Lock Up Stage', status: 'pending' }, position: { x: 250, y: 600 } },
            { id: '9', type: 'default', data: { label: 'Rough-in (Elec/Plumb)', status: 'pending' }, position: { x: 250, y: 700 } },
            { id: '10', type: 'default', data: { label: 'Plaster & Insulation', status: 'pending' }, position: { x: 250, y: 800 } },
            { id: '11', type: 'default', data: { label: 'Fixing Stage (Carpentry)', status: 'pending' }, position: { x: 250, y: 900 } },
            { id: '12', type: 'default', data: { label: 'Painting & Tiling', status: 'pending' }, position: { x: 250, y: 1000 } },
            { id: '13', type: 'milestone', data: { label: 'Practical Completion', status: 'pending' }, position: { x: 250, y: 1100 } },
            { id: '14', type: 'output', data: { label: 'Client Handover', status: 'pending' }, position: { x: 250, y: 1200 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' },
            { id: 'e5-7', source: '5', target: '7', type: 'custom' },
            { id: 'e6-8', source: '6', target: '8', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom' },
            { id: 'e8-9', source: '8', target: '9', type: 'custom' },
            { id: 'e9-10', source: '9', target: '10', type: 'custom' },
            { id: 'e10-11', source: '10', target: '11', type: 'custom' },
            { id: 'e11-12', source: '11', target: '12', type: 'custom' },
            { id: 'e12-13', source: '12', target: '13', type: 'custom' },
            { id: 'e13-14', source: '13', target: '14', type: 'custom' },
        ]
    },
    renovation_bathroom: {
        title: "Bathroom Renovation",
        description: "Standard workflow for stripping and refitting a bathroom.",
        nodes: [
            { id: '1', type: 'input', data: { label: 'Disconnect Services', status: 'pending' }, position: { x: 250, y: 0 } },
            { id: '2', type: 'default', data: { label: 'Demolition / Strip Out', status: 'pending' }, position: { x: 250, y: 100 } },
            { id: '3', type: 'decision', data: { label: 'Structural Rot?', status: 'pending' }, position: { x: 250, y: 200 } },
            { id: '4', type: 'default', data: { label: 'Repair Framing', status: 'pending' }, position: { x: 100, y: 300 } },
            { id: '5', type: 'default', data: { label: 'Rough-in Plumbing', status: 'pending' }, position: { x: 250, y: 400 } },
            { id: '6', type: 'default', data: { label: 'Sheeting & Waterproofing', status: 'pending' }, position: { x: 250, y: 500 } },
            { id: '7', type: 'approval', data: { label: 'Waterproof Inspection', status: 'pending' }, position: { x: 250, y: 600 } },
            { id: '8', type: 'default', data: { label: 'Tiling', status: 'pending' }, position: { x: 250, y: 700 } },
            { id: '9', type: 'output', data: { label: 'Fit-off & Clean', status: 'pending' }, position: { x: 250, y: 800 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom', sourceHandle: 'true', label: 'Yes' },
            { id: 'e3-5', source: '3', target: '5', type: 'custom', sourceHandle: 'false', label: 'No' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' },
            { id: 'e6-7', source: '6', target: '7', type: 'custom' },
            { id: 'e7-8', source: '7', target: '8', type: 'custom' },
            { id: 'e8-9', source: '8', target: '9', type: 'custom' },
        ]
    },
    inspection: {
        title: "Site Safety Inspection",
        description: "Mandatory OH&S site audit checklist.",
        nodes: [
            { id: '1', type: 'input', data: { label: 'Arrive at Site', status: 'completed' }, position: { x: 250, y: 0 } },
            { id: '2', type: 'default', data: { label: 'Check PPE Compliance', status: 'pending' }, position: { x: 250, y: 100 } },
            { id: '3', type: 'default', data: { label: 'Inspect Scaffolding', status: 'pending' }, position: { x: 250, y: 200 } },
            { id: '4', type: 'default', data: { label: 'Check Electrical Tags', status: 'pending' }, position: { x: 250, y: 300 } },
            { id: '5', type: 'decision', data: { label: 'Hazards Found?', status: 'pending' }, position: { x: 250, y: 400 } },
            { id: '6', type: 'default', data: { label: 'Log Issue & Notify', status: 'pending' }, position: { x: 100, y: 500 } },
            { id: '7', type: 'output', data: { label: 'Sign-off Report', status: 'pending' }, position: { x: 250, y: 600 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom', sourceHandle: 'true' },
            { id: 'e5-7', source: '5', target: '7', type: 'custom', sourceHandle: 'false' },
            { id: 'e6-7', source: '6', target: '7', type: 'custom' },
        ]
    },
    onboarding: {
        title: "Subcontractor Onboarding",
        description: "Process for verifying and inducting new trades.",
        nodes: [
            { id: '1', type: 'input', data: { label: 'Receive Application', status: 'pending' }, position: { x: 250, y: 0 } },
            { id: '2', type: 'default', data: { label: 'Verify Insurance (COC)', status: 'pending' }, position: { x: 250, y: 100 } },
            { id: '3', type: 'default', data: { label: 'Check Licenses', status: 'pending' }, position: { x: 250, y: 200 } },
            { id: '4', type: 'decision', data: { label: 'Documents Valid?', status: 'pending' }, position: { x: 250, y: 300 } },
            { id: '5', type: 'default', data: { label: 'Request Update', status: 'pending' }, position: { x: 100, y: 400 } },
            { id: '6', type: 'default', data: { label: 'Site Induction', status: 'pending' }, position: { x: 400, y: 400 } },
            { id: '7', type: 'output', data: { label: 'Approve to Work', status: 'pending' }, position: { x: 250, y: 500 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom', sourceHandle: 'false' },
            { id: 'e4-6', source: '4', target: '6', type: 'custom', sourceHandle: 'true' },
            { id: 'e5-2', source: '5', target: '2', type: 'custom' }, // Loop back
            { id: 'e6-7', source: '6', target: '7', type: 'custom' },
        ]
    },
    quote_approval: {
        title: "Commercial Quote Approval",
        description: "Multi-stage approval workflow for high-value quotes.",
        nodes: [
            { id: '1', type: 'input', data: { label: 'Quote Created', status: 'completed' }, position: { x: 250, y: 0 } },
            { id: '2', type: 'default', data: { label: 'Estimator Review', status: 'pending' }, position: { x: 250, y: 100 } },
            { id: '3', type: 'decision', data: { label: 'Value > $50k?', status: 'pending' }, position: { x: 250, y: 200 } },
            { id: '4', type: 'approval', data: { label: 'Director Approval', status: 'pending' }, position: { x: 100, y: 300 } },
            { id: '5', type: 'default', data: { label: 'Send to Client', status: 'pending' }, position: { x: 250, y: 400 } },
            { id: '6', type: 'milestone', data: { label: 'Client Acceptance', status: 'pending' }, position: { x: 250, y: 500 } },
            { id: '7', type: 'output', data: { label: 'Convert to Project', status: 'pending' }, position: { x: 250, y: 600 } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom', sourceHandle: 'true' },
            { id: 'e3-5', source: '3', target: '5', type: 'custom', sourceHandle: 'false' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' },
            { id: 'e6-7', source: '6', target: '7', type: 'custom' },
        ]
    }
};

module.exports = templates;

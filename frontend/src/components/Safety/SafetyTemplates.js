export const SAFETY_TEMPLATES = [
    {
        id: 'heights',
        title: 'SWMS - Working at Heights',
        type: 'SWMS',
        data: {
            activity: 'General working at heights tasks using ladders, scaffolds, or EWP.',
            ppe: { helmet: true, boots: true, harness: true, vest: true },
            steps: [
                {
                    id: 1,
                    activity: 'Arrival & Assessment',
                    hazards: 'Uneven ground, overhead powerlines, weather conditions.',
                    risk: { label: 'HIGH', score: 3, l: 2, c: 3 },
                    controls: 'Inspect area. Check weather. Locate powerlines. Ensure ground is stable.',
                    residualRisk: { label: 'LOW', score: 1, l: 0, c: 1 }
                },
                {
                    id: 2,
                    activity: 'Setup of Access Equipment (Ladder/Scaffold)',
                    hazards: 'Equipment failure, incorrect setup, falling objects.',
                    risk: { label: 'HIGH', score: 3, l: 3, c: 3 },
                    controls: 'Inspect tag on scaffold. Secure ladder at top and bottom. Use 4:1 rule for ladders. Exclusion zone below.',
                    residualRisk: { label: 'LOW', score: 1, l: 1, c: 1 }
                },
                {
                    id: 3,
                    activity: 'Working on Roof / Platform',
                    hazards: 'Falls from height, slip/trip, dropping tools.',
                    risk: { label: 'EXTREME', score: 4, l: 3, c: 4 },
                    controls: 'Use harness connected to anchor point. Tool lanyards. Edge protection. Non-slip footwear.',
                    residualRisk: { label: 'MEDIUM', score: 2, l: 1, c: 3 }
                }
            ]
        }
    },
    {
        id: 'electrical',
        title: 'SWMS - Electrical Isolation & Work',
        type: 'SWMS',
        data: {
            activity: 'Isolation of electrical circuits and minor installations.',
            ppe: { helmet: true, boots: true, glasses: true, gloves: true },
            steps: [
                {
                    id: 1,
                    activity: 'Identify Circuit',
                    hazards: 'Electrocution, arc flash, wrong circuit identified.',
                    risk: { label: 'EXTREME', score: 4, l: 3, c: 4 },
                    controls: 'Test before touch. Use toner/tracer. Verify with multimeter.',
                    residualRisk: { label: 'MEDIUM', score: 2, l: 1, c: 4 }
                },
                {
                    id: 2,
                    activity: 'Isolation (LOTO)',
                    hazards: 'Re-energisation by others.',
                    risk: { label: 'HIGH', score: 3, l: 3, c: 3 },
                    controls: 'Apply Lock Out Tag Out (LOTO) lock and tag. Inform site supervisor.',
                    residualRisk: { label: 'LOW', score: 1, l: 0, c: 1 }
                }
            ]
        }
    },
    {
        id: 'excavation',
        title: 'SWMS - Excavation & Trenching',
        type: 'SWMS',
        data: {
            activity: 'Trenching for pipe/cable laying.',
            ppe: { helmet: true, boots: true, ears: true, vest: true },
            steps: [
                {
                    id: 1,
                    activity: 'Service Location',
                    hazards: 'Hitting gas/water/power lines.',
                    risk: { label: 'EXTREME', score: 4, l: 4, c: 4 },
                    controls: 'Dial Before You Dig plans. Use cable locator. Pothole by hand first.',
                    residualRisk: { label: 'MEDIUM', score: 2, l: 2, c: 3 }
                },
                {
                    id: 2,
                    activity: 'Excavation via Machinery',
                    hazards: 'Collapse of trench, machinery striking workers.',
                    risk: { label: 'HIGH', score: 3, l: 3, c: 4 },
                    controls: 'Bench/batter trench >1.5m. Exclusion zones. Spotter required.',
                    residualRisk: { label: 'LOW', score: 1, l: 1, c: 2 }
                }
            ]
        }
    },
    {
        id: 'toolbox',
        title: 'Toolbox Talk - Weekly Site Safety',
        type: 'TOOLBOX_TALK',
        data: {
            topic: 'Weekly Site Hazards & Coordination',
            notes: '1. Review of high risk activities for the week.\n2. PPE compliance check.\n3. Housekeeping standards.\n4. Weather forecast review.',
            attendees: ''
        }
    }
];

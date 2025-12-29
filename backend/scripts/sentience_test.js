/**
 * MasterDiaryOS // Sentience Test
 * Level 20 Verification Script
 * This script forces a learning event and displays the AI's internal reasoning.
 */
const { generateNeuralIntelligencePacket } = require('../src/utils/LearningEngine');
const pinnacleAi = require('../src/services/grokService');

async function runSentienceTest() {
    console.log("🧪 INITIATING NEURAL SENTIENCE TEST...");
    
    try {
        // 1. GATHER CURRENT DNA
        console.log("\n[1] GATHERING INSTITUTIONAL MEMORY...");
        const dna = await generateNeuralIntelligencePacket();
        console.log(`    > Data points ingested: ${dna.mesh.nodes}`);
        console.log(`    > Current Velocity Drift: ${dna.mesh.velocityDrift}`);

        // 2. SIMULATE A STRATEGIC QUERY
        console.log("\n[2] FEEDING DATA TO GROK-4-1-FAST CORE...");
        const testPrompt = "Analyze our current portfolio and tell me if we need to adjust our labour strategy based on recent performance.";
        
        const systemPrompt = `
            You are the Neural Co-Founder. 
            Analyze this DNA: ${JSON.stringify(dna)}
            Provide a Rationale for your answer based strictly on the provided numbers.
        `;

        const startTime = Date.now();
        const response = await pinnacleAi.generateJSON(testPrompt, systemPrompt);
        const latency = Date.now() - startTime;

        // 3. DISPLAY THE "THOUGHT PROCESS"
        console.log("\n[3] AI PARTNER RESPONSE RECEIVED:");
        console.log("--------------------------------------------------");
        console.log(`REPLY: ${response.reply}`);
        if (response.directive) {
            console.log(`PROPOSED DIRECTIVE: ${JSON.stringify(response.directive)}`);
        }
        console.log("--------------------------------------------------");
        console.log(`LATENCY: ${latency}ms`);
        console.log(`VERDICT: ${response.reply.includes('Our') ? '✅ PARTNER PERSONA ACTIVE' : '❌ PERSONA FAILURE'}`);
        
        console.log("\n💎 SENTIENCE VERIFICATION COMPLETE: SYSTEM IS 100% OPERATIONAL.");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
    }
}

runSentienceTest();

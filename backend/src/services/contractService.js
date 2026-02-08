const { Contract, Project } = require('../models');
const grokService = require('./grokService');

class ContractService {
    
    /**
     * Analyzes raw contract text to extract "Rules of Engagement"
     */
    async analyzeContractText(text, projectId) {
        try {
            const prompt = `
                You are "Ironclad", a Senior Construction Lawyer and Contract Analyst.
                
                **MISSION:**
                Analyze the following construction contract text and extract the key "Rules of Engagement" into a structured JSON format.
                
                **RAW TEXT:**
                "${text.substring(0, 15000)}" // Truncate for token limits if needed
                
                **REQUIRED OUTPUT (JSON ONLY):**
                {
                    "contractSum": number (estimate if found),
                    "retentionPercent": number (e.g. 5),
                    "defectPeriod": number (months),
                    "paymentTerms": string (e.g. "NET14", "EOM+30"),
                    "liquidatedDamages": number (daily rate),
                    "inclusions": ["List", "of", "key", "inclusions"],
                    "exclusions": ["List", "of", "explicit", "exclusions"],
                    "keyClauses": [
                        { "title": "Clause Name", "summary": "Brief explanation", "riskLevel": "high" | "medium" | "low" }
                    ]
                }
            `;

            const analysis = await grokService.generateJSON(prompt, "You are a ruthless legal analyst. Extract the truth.");
            
            // Save or Update Contract Record
            // Logic to find existing or create new would go here in a full flow
            // For now, we return the analysis for the controller to save
            return analysis;

        } catch (error) {
            console.error("Ironclad Analysis Failed:", error);
            throw new Error("Failed to analyze contract: " + error.message);
        }
    }

    /**
     * Cross-checks a proposed variation against the contract scope
     */
    async checkScope(taskDescription, projectId) {
        const contract = await Contract.findOne({ where: { projectId, status: 'active' } });
        if (!contract || !contract.intelligence) return { status: 'unknown', reason: 'No active contract found' };

        const intel = contract.intelligence;
        
        // Simple keyword match first (Fast)
        const isExcluded = intel.exclusions.some(ex => taskDescription.toLowerCase().includes(ex.toLowerCase()));
        
        if (isExcluded) {
            return { 
                status: 'variation', 
                confidence: 'high',
                reason: `Matched exclusion: "${intel.exclusions.find(ex => taskDescription.toLowerCase().includes(ex.toLowerCase()))}"`
            };
        }

        // Deep AI Check (Slow but smart)
        // ... (Future implementation)

        return { status: 'in_scope', confidence: 'medium' };
    }
}

module.exports = new ContractService();

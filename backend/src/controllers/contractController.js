const { Contract, Project } = require('../models');
const contractService = require('../services/contractService');

const createContract = async (req, res) => {
    try {
        const { projectId, title, text, fileUrl } = req.body;
        
        // 1. Create Initial Record
        const contract = await Contract.create({
            projectId,
            title,
            fileUrl,
            extractedText: text,
            status: 'analyzing'
        });

        // 2. Trigger AI Analysis (Async)
        // In production, use a queue. Here we await for demo speed or fire-and-forget.
        // Let's await to show the user the "Magic" immediately.
        const intelligence = await contractService.analyzeContractText(text, projectId);
        
        // 3. Update Record
        await contract.update({
            intelligence,
            status: 'active'
        });

        res.json(contract);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getContracts = async (req, res) => {
    try {
        const { projectId } = req.query;
        const contracts = await Contract.findAll({
            where: { projectId },
            order: [['createdAt', 'DESC']]
        });
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContract,
    getContracts
};

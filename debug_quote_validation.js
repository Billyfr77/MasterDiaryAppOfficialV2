
const { sequelize, User, Quote, Project } = require('./backend/src/models');
const Joi = require('joi');

const quoteSchema = Joi.object({
  name: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
  projectId: Joi.string().optional().allow(null, ''),
  clientId: Joi.string().optional().allow(null, ''),
  marginPct: Joi.number().optional(),
  nodes: Joi.array().optional(),
  edges: Joi.array().optional(),
  staff: Joi.array().optional(),
  equipment: Joi.array().optional(),
  visualData: Joi.object().unknown(true).optional().allow(null)
}).unknown(true);

async function debugQuoteSave() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const user = await User.findOne();
        if (!user) { console.error("No user found."); return; }
        console.log(`Testing with User: ${user.id}`);

        // Construct payload mimicking the frontend failure case
        const payload = {
            projectId: null,
            clientId: null,
            marginPct: 20,
            nodes: [],
            edges: [],
            staff: [],
            equipment: [],
            visualData: {},
            totalCost: 0,
            totalRevenue: 0,
            version: 0,
            name: "Debug Quote Final"
        };

        console.log("1. Validating Payload with Joi...");
        const { error, value } = quoteSchema.validate(payload);
        if (error) {
            console.error("   - Joi Validation FAILED:", error.details[0].message);
            return;
        }
        console.log("   - Joi Validation PASSED.");

        console.log("2. Testing Project Lookup Logic...");
        if (value.projectId) {
            const project = await Project.findByPk(value.projectId);
            if (!project) console.error("   - Project Not Found (Simulated 404)");
            else console.log("   - Project Found.");
        } else {
            console.log("   - ProjectId is null/empty. Skipping lookup (Correct behavior).");
        }

        console.log("3. Attempting Database Insert...");
        try {
            const quote = await Quote.create({
                name: value.name,
                status: 'approved',
                projectId: value.projectId || null,
                clientId: value.clientId || null,
                userId: user.id,
                marginPct: value.marginPct,
                nodes: value.nodes || [],
                edges: value.edges || [],
                staff: value.staff || [],
                equipment: value.equipment || [],
                visualData: value.visualData || {},
                totalCost: 0,
                totalRevenue: 0
            });
            console.log("   - Quote Saved Successfully! ID:", quote.id);
        } catch (dbError) {
            console.error("   - Database Insert FAILED:", dbError.message);
            console.error("   - Original Error:", dbError.original ? dbError.original.message : "N/A");
        }

    } catch (err) {
        console.error("FATAL ERROR:", err);
    } finally {
        await sequelize.close();
    }
}

debugQuoteSave();


const { generateNeuralIntelligencePacket } = require('./backend/src/utils/LearningEngine');
const { sequelize } = require('./backend/src/models');

async function runDebug() {
    try {
        console.log("Connecting to DB...");
        await sequelize.authenticate();
        console.log("DB Connected. Generating Packet...");
        const packet = await generateNeuralIntelligencePacket();
        if (packet) {
            console.log("Packet Generated Successfully!");
            // console.log(JSON.stringify(packet, null, 2));
        } else {
            console.log("Packet returned NULL (Failed silently in function).");
        }
    } catch (error) {
        console.error("Fatal Error in Debug Script:", error);
    } finally {
        await sequelize.close();
    }
}

runDebug();

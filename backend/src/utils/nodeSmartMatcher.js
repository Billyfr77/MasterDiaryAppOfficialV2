
const { Node, Staff, Equipment } = require('../models');

/**
 * Processes a list of items to either link them to existing resources or create new ones.
 * @param {Array} items - Array of item objects (from frontend).
 * @param {String} type - 'material' | 'staff' | 'equipment'.
 * @param {String} userId - The ID of the user performing the action.
 * @returns {Array} - The processed items with correct database IDs.
 */
const processNewItems = async (items, type, userId) => {
    const processed = [];
    for (const item of items || []) {
        // Detect if this is a React Flow node (has .data property)
        const isNode = item.data && typeof item.data === 'object';
        const target = isNode ? item.data : item;

        // Determine the ID field name based on type
        const idField = type === 'material' ? 'nodeId' : type === 'staff' ? 'staffId' : 'equipmentId';
        const idVal = target[idField];

        // --- SMART RECOGNITION CORE ---
        // If the item is marked as new OR has a temp AI-generated ID
        if (target.isNew || (typeof idVal === 'string' && idVal.startsWith('ai-'))) {
            try {
                let existingItem;
                const name = target.name?.trim() || target.label?.trim(); // Support label as name fallback

                if (!name) {
                    processed.push(item);
                    continue;
                }

                // 1. Try to find an existing match in the user's library
                if (type === 'material') {
                    existingItem = await Node.findOne({ where: { name, userId } });
                } else if (type === 'staff') {
                    existingItem = await Staff.findOne({ where: { name, userId } });
                } else if (type === 'equipment') {
                    existingItem = await Equipment.findOne({ where: { name, userId } });
                }

                if (existingItem) {
                    // Match found! Link to it.
                    console.log(`[SmartMatch] Linked to existing ${type}: ${name} (${existingItem.id})`);
                    target[idField] = existingItem.id;
                    
                    // Optional: Update local item properties with DB truth if desired?
                    // For now, we keep the quote-specific rate override if provided.
                } else {
                    // No match found. Create a new resource in the library.
                    console.log(`[SmartMatch] Creating NEW ${type}: ${name}`);
                    let newItem;
                    if (type === 'material') {
                        newItem = await Node.create({
                            name: name,
                            pricePerUnit: parseFloat(target.pricePerUnit || target.rate || target.cost) || 0,
                            category: 'material',
                            unit: target.unit || 'unit',
                            userId
                        });
                        target.nodeId = newItem.id;
                    } else if (type === 'staff') {
                        newItem = await Staff.create({
                            name: name,
                            role: 'General',
                            payRateBase: parseFloat(target.chargeRate || target.rate) || 0, 
                            chargeOutBase: parseFloat(target.chargeRate || target.rate) || 0,
                            userId
                        });
                        target.staffId = newItem.id;
                    } else if (type === 'equipment') {
                        newItem = await Equipment.create({
                            name: name,
                            category: 'General',
                            ownership: 'Owned',
                            costRateBase: parseFloat(target.costRate || target.rate) || 0,
                            userId
                        });
                        target.equipmentId = newItem.id;
                    }
                }
                
                // Clean up flags
                delete target.isNew; 
            } catch (err) {
                console.error(`Failed to auto-recognize/create resource: ${err.message}`);
            }
        }
        processed.push(item);
    }
    return processed;
};

module.exports = { processNewItems };

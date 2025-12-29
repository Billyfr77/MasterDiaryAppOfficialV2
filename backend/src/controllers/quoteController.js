/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
const { Quote, Node, Project, Staff, Equipment, Client } = require('../models');
const Joi = require('joi');
const workflowEngine = require('../services/workflowEngine');

const quoteSchema = Joi.object({
  name: Joi.string().optional(),
  status: Joi.string().optional(),
  projectId: Joi.string().optional(),
  clientId: Joi.string().optional().allow(null),
  marginPct: Joi.number().optional(),
  nodes: Joi.array().optional(),
  staff: Joi.array().optional(),
  equipment: Joi.array().optional(),
  visualData: Joi.object().unknown(true).optional().allow(null)
}).unknown(true);

const processNewItems = async (items, type, userId) => {
    const processed = [];
    for (const item of items || []) {
        const idField = type === 'material' ? 'nodeId' : type === 'staff' ? 'staffId' : 'equipmentId';
        const idVal = item[idField];

        // --- SMART RECOGNITION CORE ---
        // If the item is marked as new, check if we ALREADY have this in our DNA library
        if (item.isNew || (typeof idVal === 'string' && idVal.startsWith('ai-'))) {
            try {
                let existingItem;
                const name = item.name?.trim();

                if (type === 'material') {
                    existingItem = await Node.findOne({ where: { name, userId } });
                } else if (type === 'staff') {
                    existingItem = await Staff.findOne({ where: { name, userId } });
                } else if (type === 'equipment') {
                    existingItem = await Equipment.findOne({ where: { name, userId } });
                }

                if (existingItem) {
                    console.log(`[SmartMatch] Linked to existing ${type}: ${name}`);
                    item[idField] = existingItem.id;
                } else {
                    // Only create if it truly doesn't exist
                    let newItem;
                    if (type === 'material') {
                        newItem = await Node.create({
                            name: item.name || 'New Material',
                            pricePerUnit: parseFloat(item.pricePerUnit) || 0,
                            category: 'material',
                            unit: 'unit',
                            userId
                        });
                        item.nodeId = newItem.id;
                    } else if (type === 'staff') {
                        newItem = await Staff.create({
                            name: item.name || 'New Staff',
                            role: 'General',
                            payRateBase: parseFloat(item.chargeRate) || 0, 
                            chargeOutBase: parseFloat(item.chargeRate) || 0,
                            userId
                        });
                        item.staffId = newItem.id;
                    } else if (type === 'equipment') {
                        newItem = await Equipment.create({
                            name: item.name || 'New Equipment',
                            category: 'General',
                            ownership: 'Owned',
                            costRateBase: parseFloat(item.costRate) || 0,
                            userId
                        });
                        item.equipmentId = newItem.id;
                    }
                }
                delete item.isNew; 
            } catch (err) {
                console.error(`Failed to auto-recognize/create resource: ${err.message}`);
            }
        }
        processed.push(item);
    }
    return processed;
};

const calculateTotals = async (nodes, staff, equipment, userId) => {
  let totalCost = 0;

  for (const item of nodes || []) {
    if (item.type === 'metadata' || item.nodeId === 'METADATA') continue;
    let price = item.pricePerUnit || item.price || 0;
    if (!price && item.nodeId) {
        try {
          const node = await Node.findOne({ where: { id: item.nodeId } });
          if (node) price = parseFloat(node.pricePerUnit);
        } catch (err) {}
    }
    totalCost += parseFloat(price || 0) * (parseFloat(item.quantity) || 0);
  }

  for (const item of staff || []) {
    let rate = item.chargeRate || item.rate || 0;
    if (!rate && item.staffId) {
        try {
          const staffMember = await Staff.findOne({ where: { id: item.staffId } });
          if (staffMember) rate = staffMember.chargeRates?.base || 0;
        } catch (err) {}
    }
    totalCost += parseFloat(rate || 0) * (parseFloat(item.hours) || 0);
  }

  for (const item of equipment || []) {
     let rate = item.costRate || item.rate || 0;
     if (!rate && item.equipmentId) {
        try {
          const equipmentItem = await Equipment.findOne({ where: { id: item.equipmentId } });
          if (equipmentItem) rate = equipmentItem.costRates?.base || 0;
        } catch (err) {}
     }
     totalCost += parseFloat(rate || 0) * (parseFloat(item.hours) || 0);
  }

  return totalCost;
};

const getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { projectId } = req.query;

    const where = req.user ? { userId: req.user?.id || null } : {};
    if (projectId) where.projectId = projectId;

    const { count, rows } = await Quote.findAndCountAll({
      where,
      include: [
          { model: Project, as: 'project' },
          { model: Client, as: 'clientDetails', required: false }
      ],
      limit,
      offset
    });

    res.json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      where: { id: req.params.id, userId: req.user?.id || null },
      include: [
          { model: Project, as: 'project' },
          { model: Client, as: 'clientDetails', required: false }
      ]
    });
    if (quote) {
      res.json(quote);
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createQuote = async (req, res) => {
  try {
    const { error, value } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findByPk(value.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 1. Process New Items (Auto-Create Resources)
    const userId = req.user?.id;
    const processedNodes = await processNewItems(value.nodes, 'material', userId);
    const processedStaff = await processNewItems(value.staff, 'staff', userId);
    const processedEquipment = await processNewItems(value.equipment, 'equipment', userId);

    const totalCost = await calculateTotals(processedNodes, processedStaff, processedEquipment, userId);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    const quote = await Quote.create({
      name: value.name,
      status: value.status || 'draft',
      projectId: value.projectId,
      clientId: value.clientId || null,
      userId: userId || null,
      marginPct: value.marginPct,
      nodes: processedNodes || [],
      staff: processedStaff || [],
      equipment: processedEquipment || [],
      visualData: value.visualData || {},
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    });

    // --- WORKFLOW ENGINE INTEGRATION ---
    if (quote.status === 'approved') {
        const workflowEngine = require('../services/workflowEngine');
        workflowEngine.emit('quote.approved', { quote, userId });
    }

    res.status(201).json(quote);
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateQuote = async (req, res) => {
  try {
    const { error, value } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user?.id;
    const existingQuote = await Quote.findByPk(req.params.id);
    if (!existingQuote) return res.status(404).json({ error: 'Quote not found' });

    // --- CONFLICT RESOLUTION CORE (OPTIMISTIC LOCK) ---
    if (req.body.version !== undefined && existingQuote.version !== req.body.version) {
        return res.status(409).json({ 
            error: 'Conflict detected', 
            currentRecord: existingQuote 
        });
    }

    // 1. Process New Items
    const processedNodes = await processNewItems(value.nodes, 'material', userId);
    const processedStaff = await processNewItems(value.staff, 'staff', userId);
    const processedEquipment = await processNewItems(value.equipment, 'equipment', userId);

    const totalCost = await calculateTotals(processedNodes, processedStaff, processedEquipment, userId);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    const [updated] = await Quote.update({
      name: value.name,
      projectId: value.projectId,
      clientId: value.clientId || null,
      marginPct: value.marginPct,
      status: value.status,
      nodes: processedNodes || [],
      staff: processedStaff || [],
      equipment: processedEquipment || [],
      visualData: value.visualData,
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    }, {
      where: { id: req.params.id, userId: req.user?.id || null }
    });

    if (updated) {
      const updatedQuote = await Quote.findByPk(req.params.id);

      // TRIGGER WORKFLOW: Quote Approved
      if (updatedQuote.status === 'approved') { // Check if status is approved
          console.log(`[QuoteController] Triggering workflow for Quote ${updatedQuote.id}`);
          workflowEngine.emit('quote.approved', { 
              quote: updatedQuote.toJSON(), 
              user: req.user 
          });
      }

      res.json(updatedQuote);
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    console.error('Quote update error:', error);
    res.status(400).json({ error: error.message });
  }
};

const deleteQuote = async (req, res) => {
  try {
    const deleted = await Quote.destroy({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (deleted) {
      res.json({ message: 'Quote deleted successfully' });
    } else {
      res.status(404).json({ error: 'Quote not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote
};
/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
const { Quote, Node, Project, Staff, Equipment, Client } = require('../models');
const Joi = require('joi');
const workflowEngine = require('../services/workflowEngine');
const { processNewItems } = require('../utils/nodeSmartMatcher');

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

const calculateTotals = async (nodes, staff, equipment, userId) => {
  let totalCost = 0;

  for (const item of nodes || []) {
    const target = (item.data && typeof item.data === 'object') ? item.data : item;
    
    if (item.type === 'metadata' || target.nodeId === 'METADATA') continue;
    
    let price = target.pricePerUnit || target.price || target.rate || 0;
    if (!price && target.nodeId) {
        try {
          const node = await Node.findOne({ where: { id: target.nodeId } });
          if (node) price = parseFloat(node.pricePerUnit);
        } catch (err) {}
    }
    totalCost += parseFloat(price || 0) * (parseFloat(target.quantity) || 0);
  }

  for (const item of staff || []) {
    const target = (item.data && typeof item.data === 'object') ? item.data : item;
    
    let rate = target.chargeRate || target.rate || 0;
    if (!rate && target.staffId) {
        try {
          const staffMember = await Staff.findOne({ where: { id: target.staffId } });
          if (staffMember) rate = staffMember.chargeRates?.base || 0;
        } catch (err) {}
    }
    totalCost += parseFloat(rate || 0) * (parseFloat(target.hours || target.quantity) || 0);
  }

  for (const item of equipment || []) {
     const target = (item.data && typeof item.data === 'object') ? item.data : item;
     
     let rate = target.costRate || target.rate || 0;
     if (!rate && target.equipmentId) {
        try {
          const equipmentItem = await Equipment.findOne({ where: { id: target.equipmentId } });
          if (equipmentItem) rate = equipmentItem.costRates?.base || 0;
        } catch (err) {}
     }
     totalCost += parseFloat(rate || 0) * (parseFloat(target.hours || target.quantity) || 0);
  }

  return totalCost;
};

const getAllQuotes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { projectId } = req.query;

    const where = { userId };
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

    // Only validate project if projectId is provided
    if (value.projectId) {
        const project = await Project.findByPk(value.projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
    }

    // 1. Process New Items (Auto-Create Resources)
    const userId = req.user?.id;
    
    // Logic: processNewItems should handle the .data property if it exists, or the raw object
    const processedNodes = await processNewItems(value.nodes, 'material', userId);
    const processedStaff = await processNewItems(value.staff, 'staff', userId);
    const processedEquipment = await processNewItems(value.equipment, 'equipment', userId);

    let totalCost = await calculateTotals(processedNodes, processedStaff, processedEquipment, userId);
    if (isNaN(totalCost)) totalCost = 0;
    
    let totalRevenue = totalCost * (1 + (parseFloat(value.marginPct) || 0) / 100);
    if (isNaN(totalRevenue)) totalRevenue = totalCost;

    const quote = await Quote.create({
      name: value.name || `Quote ${new Date().toLocaleDateString()}`,
      status: value.status || 'draft',
      projectId: value.projectId || null,
      clientId: value.clientId || null,
      userId: userId || null,
      marginPct: parseFloat(value.marginPct) || 0,
      nodes: processedNodes || [], // These should now be full React Flow nodes
      edges: value.edges || [],
      staff: processedStaff || [],
      equipment: processedEquipment || [],
      visualData: value.visualData || {},
      totalCost: parseFloat(totalCost).toFixed(2),
      totalRevenue: parseFloat(totalRevenue).toFixed(2)
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

    let totalCost = await calculateTotals(processedNodes, processedStaff, processedEquipment, userId);
    if (isNaN(totalCost)) totalCost = 0;
    
    let totalRevenue = totalCost * (1 + (parseFloat(value.marginPct) || 0) / 100);
    if (isNaN(totalRevenue)) totalRevenue = totalCost;

    const [updated] = await Quote.update({
      name: value.name,
      projectId: value.projectId || null,
      clientId: value.clientId || null,
      marginPct: parseFloat(value.marginPct) || 0,
      status: value.status,
      nodes: processedNodes || [], // Full nodes
      edges: value.edges || [],
      staff: processedStaff || [],
      equipment: processedEquipment || [],
      visualData: value.visualData,
      totalCost: parseFloat(totalCost).toFixed(2),
      totalRevenue: parseFloat(totalRevenue).toFixed(2)
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

const approveQuote = async (req, res) => {
  try {
    const userId = req.user?.id;
    const existingQuote = await Quote.findByPk(req.params.id);
    if (!existingQuote) return res.status(404).json({ error: 'Quote not found' });

    if (existingQuote.status === 'approved') {
        return res.status(400).json({ error: 'Quote is already approved' });
    }

    // Update status
    const [updated] = await Quote.update({
      status: 'approved'
    }, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedQuote = await Quote.findByPk(req.params.id, {
          include: [{ model: Project, as: 'project' }]
      });

      console.log(`[QuoteController] Quote ${updatedQuote.id} manually approved.`);
      
      // TRIGGER WORKFLOW: Quote Approved
      workflowEngine.emit('quote.approved', { 
          quote: updatedQuote.toJSON(), 
          user: req.user 
      });

      // Create System Notification
      const { Notification } = require('../models'); // Lazy load to avoid circular dep if any
      await Notification.create({
          userId: userId,
          type: 'system',
          title: 'Quote Approved',
          message: `Quote "${updatedQuote.name}" for project "${updatedQuote.project?.name || 'Unknown'}" has been approved.`,
          read: false
      });

      res.json(updatedQuote);
    } else {
      res.status(404).json({ error: 'Quote not found during update' });
    }
  } catch (error) {
    console.error('Quote approval error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  approveQuote
};
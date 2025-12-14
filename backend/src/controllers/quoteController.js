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
  visualData: Joi.object().unknown(true).optional().allow(null) // Added visualData
}).unknown(true);

const calculateTotals = async (nodes, staff, equipment, userId) => {
  let totalCost = 0;

  // Calculate materials cost
  for (const item of nodes || []) {
    if (item.type === 'metadata' || item.nodeId === 'METADATA') continue;

    let price = item.pricePerUnit || item.price || 0;
    
    if (!price && item.nodeId) {
        try {
          const node = await Node.findOne({ where: { id: item.nodeId } });
          if (node) price = parseFloat(node.pricePerUnit);
        } catch (err) { console.warn(`Material lookup failed: ${err.message}`); }
    }
    totalCost += parseFloat(price || 0) * (parseFloat(item.quantity) || 0);
  }

  // Calculate staff cost
  for (const item of staff || []) {
    let rate = item.chargeRate || item.rate || 0;

    if (!rate && item.staffId) {
        try {
          const staffMember = await Staff.findOne({ where: { id: item.staffId } });
          if (staffMember) rate = staffMember.chargeRates?.base || staffMember.payRates?.base || 0;
        } catch (err) { console.warn(`Staff lookup failed: ${err.message}`); }
    }
    totalCost += parseFloat(rate || 0) * (parseFloat(item.hours) || 0);
  }

  // Calculate equipment cost
  for (const item of equipment || []) {
     let rate = item.costRate || item.rate || 0;

     if (!rate && item.equipmentId) {
        try {
          const equipmentItem = await Equipment.findOne({ where: { id: item.equipmentId } });
          if (equipmentItem) rate = equipmentItem.costRates?.base || 0;
        } catch (err) { console.warn(`Equipment lookup failed: ${err.message}`); }
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
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        field: error.details[0].path?.[0] || 'unknown'
      });
    }

    const project = await Project.findByPk(value.projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalCost = await calculateTotals(value.nodes, value.staff, value.equipment, req.user.id);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    const quote = await Quote.create({
      name: value.name,
      status: value.status || 'draft',
      projectId: value.projectId,
      clientId: value.clientId || null,
      userId: req.user?.id || null,
      marginPct: value.marginPct,
      nodes: value.nodes || [],
      staff: value.staff || [],
      equipment: value.equipment || [],
      visualData: value.visualData || {}, // Save visual data
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    });

    const quoteWithProject = await Quote.findByPk(quote.id, {
      include: [
          { model: Project, as: 'project' },
          { model: Client, as: 'clientDetails', required: false }
      ]
    });

    res.status(201).json(quoteWithProject);
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateQuote = async (req, res) => {
  try {
    const { error, value } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        field: error.details[0].path?.[0] || 'unknown'
      });
    }

    const project = await Project.findOne({
      where: req.user ? { id: value.projectId, userId: req.user?.id || null } : { id: value.projectId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    const existingQuote = await Quote.findOne({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const totalCost = await calculateTotals(value.nodes, value.staff, value.equipment, req.user.id);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    const [updated] = await Quote.update({
      name: value.name,
      projectId: value.projectId,
      clientId: value.clientId || null,
      marginPct: value.marginPct,
      status: value.status || existingQuote.status,
      nodes: value.nodes || [],
      staff: value.staff || [],
      equipment: value.equipment || [],
      visualData: value.visualData || existingQuote.visualData, // Update visual data
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    }, {
      where: { id: req.params.id, userId: req.user?.id || null }
    });

    if (updated) {
      const updatedQuote = await Quote.findByPk(req.params.id, {
        include: [
          { model: Project, as: 'project' },
          { model: Client, as: 'clientDetails', required: false }
        ]
      });

      // Workflow Trigger
      if (value.status === 'approved' && existingQuote.status !== 'approved') {
          workflowEngine.emit('quote.approved', { quote: updatedQuote, user: req.user });
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

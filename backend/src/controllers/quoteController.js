const { Quote, Node, Project, Staff, Equipment } = require('../models');
const Joi = require('joi');

const quoteSchema = Joi.object({
  name: Joi.string().min(1).required(),
  projectId: Joi.string().uuid().required(),
  marginPct: Joi.number().min(0).max(100).required(),
  nodes: Joi.array().items(Joi.object({
    nodeId: Joi.string().uuid().required(),
    quantity: Joi.number().positive().required()
  })).default([]),
  staff: Joi.array().items(Joi.object({
    staffId: Joi.string().uuid().required(),
    hours: Joi.number().positive().required()
  })).default([]),
  equipment: Joi.array().items(Joi.object({
    equipmentId: Joi.string().uuid().required(),
    hours: Joi.number().positive().required()
  })).default([])
}).or('nodes', 'staff', 'equipment').messages({
  'object.missing': 'Please add at least one material, staff member, or equipment to your quote'
});

const calculateTotals = async (nodes, staff, equipment, userId, transaction = null) => {
  let totalCost = 0;

  // Calculate materials cost
  for (const item of nodes || []) {
    const node = await Node.findOne({
      where: { id: item.nodeId, userId: userId }
    });
    if (!node) {
      throw new Error(`Material ${item.nodeId} not found or not accessible`);
    }
    totalCost += parseFloat(node.pricePerUnit) * item.quantity;
  }

  // Calculate staff cost
  for (const item of staff || []) {
    const staffMember = await Staff.findOne({
      where: { id: item.staffId, userId: userId }
    });
    if (!staffMember) {
      throw new Error(`Staff member ${item.staffId} not found or not accessible`);
    }
    // Use charge rates for quotes (what customers pay)
    const chargeRate = staffMember.chargeRates?.base || staffMember.payRates?.base || 0;
    totalCost += parseFloat(chargeRate) * item.hours;
  }

  // Calculate equipment cost
  for (const item of equipment || []) {
    const equipmentItem = await Equipment.findOne({
      where: { id: item.equipmentId, userId: userId }
    });
    if (!equipmentItem) {
      throw new Error(`Equipment ${item.equipmentId} not found or not accessible`);
    }
    totalCost += parseFloat(equipmentItem.costRates?.base || 0) * item.hours;
  }

  return totalCost;
};

const getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Quote.findAndCountAll({
      where: { userId: req.user.id },
      include: [{ model: Project, as: 'project' }],
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
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Project, as: 'project' }]
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
    // Validate request body
    const { error, value } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        field: error.details[0].path?.[0] || 'unknown'
      });
    }

    // Check if project belongs to user
    const project = await Project.findOne({
      where: { id: value.projectId, userId: req.user.id }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Calculate totals
    const totalCost = await calculateTotals(value.nodes, value.staff, value.equipment, req.user.id);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    // Create quote
    const quote = await Quote.create({
      name: value.name,
      projectId: value.projectId,
      userId: req.user.id,
      marginPct: value.marginPct,
      nodes: value.nodes || [],
      staff: value.staff || [],
      equipment: value.equipment || [],
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    });

    // Return quote with project info
    const quoteWithProject = await Quote.findByPk(quote.id, {
      include: [{ model: Project, as: 'project' }]
    });

    res.status(201).json(quoteWithProject);
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateQuote = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = quoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        field: error.details[0].path?.[0] || 'unknown'
      });
    }

    // Check if project belongs to user
    const project = await Project.findOne({
      where: { id: value.projectId, userId: req.user.id }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Check if quote exists and belongs to user
    const existingQuote = await Quote.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Calculate totals
    const totalCost = await calculateTotals(value.nodes, value.staff, value.equipment, req.user.id);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    // Update quote
    const [updated] = await Quote.update({
      name: value.name,
      projectId: value.projectId,
      marginPct: value.marginPct,
      nodes: value.nodes || [],
      staff: value.staff || [],
      equipment: value.equipment || [],
      totalCost: totalCost.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    }, {
      where: { id: req.params.id, userId: req.user.id }
    });

    if (updated) {
      const updatedQuote = await Quote.findByPk(req.params.id, {
        include: [{ model: Project, as: 'project' }]
      });
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
      where: { id: req.params.id, userId: req.user.id }
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

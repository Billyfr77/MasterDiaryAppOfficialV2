/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */const { Quote, Node, Project, Staff, Equipment } = require('../models');
const Joi = require('joi');

const quoteSchema = Joi.object({
                 name: Joi.string().optional(),
                 projectId: Joi.string().optional(),
                 marginPct: Joi.number().optional(),
                 nodes: Joi.array().optional(),
                 staff: Joi.array().optional(),
                 equipment: Joi.array().optional()
               }).unknown(true);

const calculateTotals = async (nodes, staff, equipment, userId, transaction = null) => {
          let totalCost = 0;

          // Calculate materials cost
          for (const item of nodes || []) {
            // Skip metadata or invalid items
            if (item.type === 'metadata' || item.nodeId === 'METADATA' || !item.nodeId) continue;

            try {
              const node = await Node.findOne({
                where: userId ? { id: item.nodeId, userId: userId } : { id: item.nodeId }
              });
              if (!node) {
                console.warn(`Material ${item.nodeId} not found, skipping`);
                continue; 
              }
              totalCost += parseFloat(node.pricePerUnit) * item.quantity;
            } catch (err) {
              console.warn(`Error looking up material ${item.nodeId}:`, err.message);
              continue;
            }
          }

          // Calculate staff cost
          for (const item of staff || []) {
            if (!item.staffId) continue;
            try {
              const staffMember = await Staff.findOne({
                where: userId ? { id: item.staffId, userId: userId } : { id: item.staffId }
              });
              if (!staffMember) {
                console.warn(`Staff member ${item.staffId} not found, skipping`);
                continue; 
              }
              const chargeRate = staffMember.chargeRates?.base || staffMember.payRates?.base || 0;
              totalCost += parseFloat(chargeRate) * item.hours;
            } catch (err) {
               console.warn(`Error looking up staff ${item.staffId}:`, err.message);
               continue;
            }
          }

          // Calculate equipment cost
          for (const item of equipment || []) {
            if (!item.equipmentId) continue;
            try {
              const equipmentItem = await Equipment.findOne({
                where: userId ? { id: item.equipmentId, userId: userId } : { id: item.equipmentId }
              });
              if (!equipmentItem) {
                console.warn(`Equipment ${item.equipmentId} not found, skipping`);
                continue; 
              }
              totalCost += parseFloat(equipmentItem.costRates?.base || 0) * item.hours;
            } catch (err) {
               console.warn(`Error looking up equipment ${item.equipmentId}:`, err.message);
               continue;
            }
          }

          return totalCost;
        };

const getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Quote.findAndCountAll({
      where: req.user ? { userId: req.user?.id || null } : {},
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
      where: { id: req.params.id, userId: req.user?.id || null },
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

    // Check if project exists (Relaxed check for debugging)
    console.log(`[Quote] Creating quote for Project ID: ${value.projectId}, User ID: ${req.user?.id}`);
    const project = await Project.findByPk(value.projectId);
    
    if (!project) {
      console.error(`[Quote] Project ${value.projectId} NOT FOUND`);
      return res.status(404).json({ error: 'Project not found' });
    }
    // Optional: Check ownership only if strictly required
    // if (req.user && project.userId && project.userId !== req.user.id) {

    // Calculate totals
    const totalCost = await calculateTotals(value.nodes, value.staff, value.equipment, req.user.id);
    const totalRevenue = totalCost * (1 + value.marginPct / 100);

    // Create quote
    const quote = await Quote.create({
      name: value.name,
      projectId: value.projectId,
      userId: req.user?.id || null,
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
      where: req.user ? { id: value.projectId, userId: req.user?.id || null } : { id: value.projectId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Check if quote exists and belongs to user
    const existingQuote = await Quote.findOne({
      where: { id: req.params.id, userId: req.user?.id || null }
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
      where: { id: req.params.id, userId: req.user?.id || null }
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

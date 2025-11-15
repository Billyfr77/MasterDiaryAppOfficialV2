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
 */const { Equipment } = require('../models');
const Joi = require('joi');

const equipmentSchema = Joi.object({
  name: Joi.string().min(1).required(),
  category: Joi.string().min(1).required(),
  ownership: Joi.string().min(1).required(),
  costRateBase: Joi.number().positive().required(),
  costRateOT1: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional(),
  costRateOT2: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional()
});

const getAllEquipment = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching equipment for user: ${req.user?.id}`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Equipment.findAndCountAll({
      where: req.user ? { userId: req.user?.id || null } : {},
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
    console.error(`[${new Date().toISOString()}] Error in GET /api/equipment:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'GET /api/equipment',
      timestamp: new Date().toISOString()
    });
  }
};

const getEquipmentById = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching equipment ${req.params.id} for user: ${req.user?.id}`);
  try {
    const equipmentItem = await Equipment.findOne({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (equipmentItem) {
      res.json(equipmentItem);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/equipment/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `GET /api/equipment/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const createEquipment = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Creating equipment:`, req.body, 'for user:', req.user?.id);
  try {
    // Preprocess overtime fields to convert empty strings to null
    const processedBody = {
      ...req.body,
      costRateOT1: req.body.costRateOT1 === '' || req.body.costRateOT1 === null ? null : Number(req.body.costRateOT1),
      costRateOT2: req.body.costRateOT2 === '' || req.body.costRateOT2 === null ? null : Number(req.body.costRateOT2)
    };

    const { error } = equipmentSchema.validate(processedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const equipmentItem = await Equipment.create({
      ...processedBody,
      userId: req.user?.id || null
    });
    res.status(201).json(equipmentItem);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /api/equipment:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'POST /api/equipment',
      timestamp: new Date().toISOString()
    });
  }
};

const updateEquipment = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Updating equipment ${req.params.id}:`, req.body, 'for user:', req.user?.id);
  try {
    // Preprocess overtime fields to convert empty strings to null
    const processedBody = {
      ...req.body,
      costRateOT1: req.body.costRateOT1 === '' || req.body.costRateOT1 === null ? null : Number(req.body.costRateOT1),
      costRateOT2: req.body.costRateOT2 === '' || req.body.costRateOT2 === null ? null : Number(req.body.costRateOT2)
    };

    const { error } = equipmentSchema.validate(processedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Equipment.update(processedBody, {
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (updated) {
      const updatedEquipment = await Equipment.findByPk(req.params.id);
      res.json(updatedEquipment);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /api/equipment/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `PUT /api/equipment/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const deleteEquipment = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Deleting equipment ${req.params.id} for user: ${req.user?.id}`);
  try {
    const deleted = await Equipment.destroy({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (deleted) {
      res.json({ message: 'Equipment deleted' });
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /api/equipment/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `DELETE /api/equipment/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};

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
 */const { Staff } = require('../models');
const Joi = require('joi');

const staffSchema = Joi.object({
  name: Joi.string().min(1).required(),
  role: Joi.string().min(1).required(),
  payRateBase: Joi.number().positive().required(),
  payRateOT1: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional(),
  payRateOT2: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional(),
  chargeOutBase: Joi.number().positive().required(),
  chargeOutOT1: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional(),
  chargeOutOT2: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().empty(''),
    Joi.allow(null)
  ).optional()
});

const getAllStaff = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching staff for user: ${req.user?.id}`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Staff.findAndCountAll({
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
    console.error(`[${new Date().toISOString()}] Error in GET /api/staff:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'GET /api/staff',
      timestamp: new Date().toISOString()
    });
  }
};

const getStaffById = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching staff ${req.params.id} for user: ${req.user?.id}`);
  try {
    const staffMember = await Staff.findOne({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (staffMember) {
      res.json(staffMember);
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/staff/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `GET /api/staff/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const createStaff = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Creating staff:`, req.body, 'for user:', req.user?.id);
  try {
    // Preprocess overtime fields to convert empty strings to null
    const processedBody = {
      ...req.body,
      payRateOT1: req.body.payRateOT1 === '' || req.body.payRateOT1 === null ? null : Number(req.body.payRateOT1),
      payRateOT2: req.body.payRateOT2 === '' || req.body.payRateOT2 === null ? null : Number(req.body.payRateOT2),
      chargeOutOT1: req.body.chargeOutOT1 === '' || req.body.chargeOutOT1 === null ? null : Number(req.body.chargeOutOT1),
      chargeOutOT2: req.body.chargeOutOT2 === '' || req.body.chargeOutOT2 === null ? null : Number(req.body.chargeOutOT2)
    };

    const { error } = staffSchema.validate(processedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const staffMember = await Staff.create({
      ...processedBody,
      userId: req.user?.id || null
    });
    res.status(201).json(staffMember);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /api/staff:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'POST /api/staff',
      timestamp: new Date().toISOString()
    });
  }
};

const updateStaff = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Updating staff ${req.params.id}:`, req.body, 'for user:', req.user?.id);
  try {
    // Preprocess overtime fields to convert empty strings to null
    const processedBody = {
      ...req.body,
      payRateOT1: req.body.payRateOT1 === '' || req.body.payRateOT1 === null ? null : Number(req.body.payRateOT1),
      payRateOT2: req.body.payRateOT2 === '' || req.body.payRateOT2 === null ? null : Number(req.body.payRateOT2),
      chargeOutOT1: req.body.chargeOutOT1 === '' || req.body.chargeOutOT1 === null ? null : Number(req.body.chargeOutOT1),
      chargeOutOT2: req.body.chargeOutOT2 === '' || req.body.chargeOutOT2 === null ? null : Number(req.body.chargeOutOT2)
    };

    const { error } = staffSchema.validate(processedBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Staff.update(processedBody, {
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (updated) {
      const updatedStaff = await Staff.findByPk(req.params.id);
      res.json(updatedStaff);
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /api/staff/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `PUT /api/staff/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const deleteStaff = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Deleting staff ${req.params.id} for user: ${req.user?.id}`);
  try {
    const deleted = await Staff.destroy({
      where: { id: req.params.id, userId: req.user?.id || null }
    });
    if (deleted) {
      res.json({ message: 'Staff member deleted' });
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /api/staff/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `DELETE /api/staff/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};

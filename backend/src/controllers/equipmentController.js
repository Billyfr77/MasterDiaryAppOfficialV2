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
  costRateOT1: Joi.number().positive().optional(),
  costRateOT2: Joi.number().positive().optional()
});

const getAllEquipment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Equipment.findAndCountAll({
      where: { userId: req.user.id },
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

const getEquipmentById = async (req, res) => {
  try {
    const equipmentItem = await Equipment.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (equipmentItem) {
      res.json(equipmentItem);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { error } = equipmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const equipmentItem = await Equipment.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(equipmentItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { error } = equipmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Equipment.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    if (updated) {
      const updatedEquipment = await Equipment.findByPk(req.params.id);
      res.json(updatedEquipment);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deleted) {
      res.json({ message: 'Equipment deleted' });
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
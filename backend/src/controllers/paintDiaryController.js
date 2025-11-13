/*
 * MasterDiaryApp Official - Paint Your Day Diary Controller
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * Handles the revolutionary Paint Diary functionality with drag-and-drop,
 * canvas data, photos, voice notes, GPS, and real-time calculations
 */

const { Diary, Project, Staff, Equipment, Node } = require('../models');
const Joi = require('joi');
const { sequelize } = require('../models');
const { getSetting } = require('../utils/settingsCache');

// Paint Diary schema validation
const paintDiarySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  entries: Joi.array().items(Joi.object({
    id: Joi.number().required(),
    time: Joi.string().required(),
    note: Joi.string().allow('').optional(),
    items: Joi.array().items(Joi.object({
      id: Joi.number().required(),
      type: Joi.string().valid('staff', 'equipment', 'material').required(),
      name: Joi.string().required(),
      duration: Joi.number().min(0).required(),
      cost: Joi.number().min(0).optional(),
      revenue: Joi.number().min(0).optional(),
      quantity: Joi.number().min(0).optional(),
      data: Joi.object().optional()
    })).required(),
    photos: Joi.array().items(Joi.string()).optional(),
    voiceNotes: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      timestamp: Joi.string().required()
    }).optional()
  })).required(),
  totalCost: Joi.number().min(0).required(),
  totalRevenue: Joi.number().min(0).required(),
  productivityScore: Joi.number().min(0).max(100).required()
});

const canvasSchema = Joi.object({
  entries: Joi.array().items(Joi.object({
    id: Joi.number().required(),
    time: Joi.string().required(),
    note: Joi.string().allow('').optional(),
    items: Joi.array().items(Joi.object({
      id: Joi.number().required(),
      type: Joi.string().valid('staff', 'equipment', 'material').required(),
      name: Joi.string().required(),
      duration: Joi.number().min(0).required(),
      cost: Joi.number().min(0).optional(),
      revenue: Joi.number().min(0).optional(),
      quantity: Joi.number().min(0).optional(),
      data: Joi.object().optional()
    })).required(),
    photos: Joi.array().items(Joi.string()).optional(),
    voiceNotes: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      timestamp: Joi.string().required()
    }).optional()
  })).required()
});

// Get all paint diaries for user
const getAllPaintDiaries = async (req, res) => {
  try {
    const { date } = req.query;
    const where = { diaryType: 'paint' };

    if (date) where.date = date;

    const diaries = await Diary.findAll({
          where,
          order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

    res.json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get paint diary by ID
const getPaintDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'Project',
          where: { userId: req.user.id },
          required: true
        }
      ]
    });

    if (!diary || diary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found' });
    }

    res.json(diary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new paint diary
const createPaintDiary = async (req, res) => {
  // const transaction = await sequelize.transaction();

  try {
    // // const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      // // await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, entries, totalCost, totalRevenue, productivityScore } = req.body;

    // Process canvas data for storage
    const canvasData = entries.map(entry => ({
      ...entry,
      // Ensure all required fields are present
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    const diaryData = { // console.log('Creating diary', diaryData);
      date,
      canvasData,
      totalCost,
      totalRevenue,
      productivityScore,
      diaryType: 'paint'
    };

    const diary = await Diary.create(diaryData);
    // await transaction.commit();

    const fullDiary = await Diary.findByPk(diary.id); // console.log('Full diary', fullDiary);
    // console.log('Sending response', fullDiary); res.status(201).json(fullDiary);
  } catch (error) {
    // // await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Update paint diary
const updatePaintDiary = async (req, res) => {
  try {
    const existingDiary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found or access denied' });
    }

    // // const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, entries, totalCost, totalRevenue, productivityScore } = req.body;

    const canvasData = entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    const [updated] = await Diary.update({
      date,
      canvasData,
      totalCost,
      totalRevenue,
      productivityScore
    }, { where: { id: req.params.id } });

    if (updated) {
      const updatedDiary = await Diary.findByPk(req.params.id);
      res.json(updatedDiary);
    } else {
      res.status(404).json({ error: 'Paint diary entry not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete paint diary
const deletePaintDiary = async (req, res) => {
  try {
    const existingDiary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found or access denied' });
    }

    const deleted = await Diary.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Paint diary entry deleted' });
    } else {
      res.status(404).json({ error: 'Paint diary entry not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save canvas state
const saveCanvasState = async (req, res) => {
  try {
    const existingDiary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found or access denied' });
    }

    const { error } = canvasSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const canvasData = req.body.entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    await Diary.update({
      canvasData
    }, { where: { id: req.params.id } });

    res.json({ message: 'Canvas state saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Load canvas state
const loadCanvasState = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!diary || diary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found or access denied' });
    }

    res.json({ entries: diary.canvasData || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate real-time costs
const calculateCosts = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }

    let totalCost = 0;
    let totalRevenue = 0;

    // Process each entry
    for (const entry of entries) {
      for (const item of entry.items || []) {
        const cost = await calculateItemCost(item);
        const revenue = await calculateItemRevenue(item);

        totalCost += cost * (item.duration || 1);
        totalRevenue += revenue * (item.duration || 1);
      }
    }

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    res.json({
      totalCost: Math.round(totalCost * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate item cost
const calculateItemCost = async (item, entryTime = null, diaryDate = null) => {
  switch (item.type) {
    case 'staff':
      const staff = await Staff.findByPk(item.data?.id);
      return staff ? staff.payRateBase : 0;
    case 'equipment':
      const equipment = await Equipment.findByPk(item.data?.id);
      return equipment ? equipment.costRateBase : 0;
    case 'material':
      const material = await Node.findByPk(item.data?.id);
      return material ? material.pricePerUnit : 0;
    default:
      return 0;
  }
};

// Helper function to calculate item revenue
const calculateItemRevenue = async (item, entryTime = null, diaryDate = null) => {
  switch (item.type) {
    case 'staff':
      const staff = await Staff.findByPk(item.data?.id);
      return staff ? staff.chargeOutBase : 0;
    case 'equipment':
      const equipment = await Equipment.findByPk(item.data?.id);
      return equipment ? equipment.costRateBase * 1.2 : 0; // 20% markup
    case 'material':
      const material = await Node.findByPk(item.data?.id);
      return material ? material.pricePerUnit * 1.3 : 0; // 30% markup
    default:
      return 0;
  }
};

module.exports = {
  getAllPaintDiaries,
  getPaintDiaryById,
  createPaintDiary,
  updatePaintDiary,
  deletePaintDiary,
  saveCanvasState,
  loadCanvasState,
  calculateCosts
};

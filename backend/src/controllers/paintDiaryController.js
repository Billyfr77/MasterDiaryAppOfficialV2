/*
 * MasterDiaryApp Official - Paint Your Day Diary Controller
 * Clean version with project assignment
 */

const { Diary, Staff, Equipment, Node } = require('../models');
const Joi = require('joi');
const { sequelize } = require('../models');

const paintDiarySchema = Joi.any();

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

const getAllPaintDiaries = async (req, res) => {
  try {
    const { date } = req.query;
    const diaries = await Diary.findAll({
      where: { diaryType: 'paint', ...(date && { date }) },
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaintDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id);
    if (!diary || diary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found' });
    }

    res.json(diary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPaintDiary = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, projectId, canvasData, totalCost, totalRevenue, productivityScore } = req.body;

    const processedCanvasData = canvasData.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    const diaryData = {
      date,
      projectId,
      canvasData: processedCanvasData,
      totalCost,
      totalRevenue,
      productivityScore,
      diaryType: 'paint'
    };

    const diary = await Diary.create(diaryData, { transaction });
    await transaction.commit();

    const fullDiary = diary;

    res.status(201).json(fullDiary);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

const updatePaintDiary = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const existingDiary = await Diary.findByPk(req.params.id);
    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      await transaction.rollback();
      return res.status(404).json({ error: 'Paint diary entry not found' });
    }

    const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, projectId, canvasData, totalCost, totalRevenue, productivityScore } = req.body;

    const processedCanvasData = canvasData.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    const [updated] = await Diary.update({
      date,
      projectId,
      canvasData: processedCanvasData,
      totalCost,
      totalRevenue,
      productivityScore
    }, { where: { id: req.params.id }, transaction });

    await transaction.commit();

    if (updated) {
      const updatedDiary = await Diary.findByPk(req.params.id);
      res.json(updatedDiary);
    } else {
      res.status(404).json({ error: 'Paint diary entry not found' });
    }
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

const deletePaintDiary = async (req, res) => {
  try {
    const existingDiary = await Diary.findByPk(req.params.id);
    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found' });
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

const saveCanvasState = async (req, res) => {
  try {
    const existingDiary = await Diary.findByPk(req.params.id);
    if (!existingDiary || existingDiary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found' });
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

const loadCanvasState = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id);
    if (!diary || diary.diaryType !== 'paint') {
      return res.status(404).json({ error: 'Paint diary entry not found' });
    }

    res.json({ entries: diary.canvasData || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateCosts = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }

    let totalCost = 0;
    let totalRevenue = 0;

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

const calculateItemCost = async (item) => {
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

const calculateItemRevenue = async (item) => {
  switch (item.type) {
    case 'staff':
      const staff = await Staff.findByPk(item.data?.id);
      return staff ? staff.chargeOutBase : 0;
    case 'equipment':
      const equipment = await Equipment.findByPk(item.data?.id);
      return equipment ? equipment.costRateBase * 1.2 : 0;
    case 'material':
      const material = await Node.findByPk(item.data?.id);
      return material ? material.pricePerUnit * 1.3 : 0;
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
/*
 * MasterDiaryApp Official - Paint Your Day Diary Controller
 * Clean version with project assignment
 */

const { Diary, Staff, Equipment, Node, Project } = require('../models');const Joi = require('joi');
const { sequelize } = require('../models');

const canvasSchema = Joi.object({
  entries: Joi.array().items(Joi.object({
    id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    time: Joi.string().required(),
    note: Joi.string().allow('').optional(),
    items: Joi.array().items(Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      type: Joi.string().valid('staff', 'equipment', 'material').required(),
      name: Joi.string().required(),
      duration: Joi.number().min(0).required(),
      cost: Joi.number().min(0).optional(),
      revenue: Joi.number().min(0).optional(),
      quantity: Joi.number().min(0).optional(),
      data: Joi.object().optional(),
      dataId: Joi.alternatives().try(Joi.string(), Joi.number()).optional(), // Added dataId
      costRate: Joi.number().optional(), // Added costRate
      chargeRate: Joi.number().optional(), // Added chargeRate
      position: Joi.object().optional() // Added position
    })).required(),
    photos: Joi.array().items(Joi.string()).optional(),
    voiceNotes: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      latitude: Joi.number().required(), // Changed to latitude/longitude to match frontend
      longitude: Joi.number().required(),
      timestamp: Joi.string().optional()
    }).optional()
  })).required()
});

const paintDiarySchema = Joi.object({
  date: Joi.date().required(),
  projectId: Joi.string().uuid().optional(),
  canvasData: canvasSchema.optional(), // Reuse the detailed canvasSchema
  totalCost: Joi.number().min(0).optional().default(0),
  totalRevenue: Joi.number().min(0).optional().default(0),
  productivityScore: Joi.number().min(0).max(100).optional().default(0),
  gpsData: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional().allow(null),
    longitude: Joi.number().min(-180).max(180).optional().allow(null),
  }).optional().allow(null),
});

const getAllPaintDiaries = async (req, res) => {
  try {
    const { date } = req.query;
    const diaries = await Diary.findAll({
          where: { diaryType: 'paint', ...(date && { date }) },
          include: [{ model: Project }],
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

    const { date, projectId, canvasData, gpsData } = req.body;

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    if (canvasData && canvasData.entries) {
      calculatedCosts = await calculateCostsFromEntries(canvasData.entries);
    }

    const processedCanvasData = canvasData ? canvasData.entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    })) : [];

    const diaryData = {
      date,
      projectId,
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost,
      totalRevenue: calculatedCosts.totalRevenue,
      productivityScore: calculatedCosts.productivityScore,
      gpsData: gpsData || null,
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

    const { date, projectId, canvasData, gpsData } = req.body;

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    if (canvasData && canvasData.entries) {
      calculatedCosts = await calculateCostsFromEntries(canvasData.entries);
    }

    const processedCanvasData = canvasData ? canvasData.entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    })) : [];

    const [updated] = await Diary.update({
      date,
      projectId,
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost,
      totalRevenue: calculatedCosts.totalRevenue,
      productivityScore: calculatedCosts.productivityScore,
      gpsData: gpsData || null
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

const calculateCostsFromEntries = async (entries) => {
  if (!Array.isArray(entries)) {
    return { totalCost: 0, totalRevenue: 0, profit: 0, profitMargin: 0, productivityScore: 0 };
  }

  let totalCost = 0;
  let totalRevenue = 0;
  let totalDuration = 0;
  let billableDuration = 0;

  for (const entry of entries) {
    for (const item of entry.items || []) {
      const cost = await calculateItemCost(item);
      const revenue = await calculateItemRevenue(item);

      totalCost += cost * (item.duration || 1);
      totalRevenue += revenue * (item.duration || 1);
      totalDuration += (item.duration || 0);

      // Assuming 'staff' and 'equipment' items contribute to billable duration
      if (item.type === 'staff' || item.type === 'equipment') {
        billableDuration += (item.duration || 0);
      }
    }
  }

  const profit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Simple productivity score: ratio of billable duration to total duration
  // This can be refined later
  const productivityScore = totalDuration > 0 ? (billableDuration / totalDuration) * 100 : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
    productivityScore: Math.round(productivityScore)
  };
};

const calculateCosts = async (req, res) => {
  try {
    const { entries } = req.body;
    const calculatedCosts = await calculateCostsFromEntries(entries);
    res.json(calculatedCosts);
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
/*
 * MasterDiaryApp Official - Paint Your Day Diary Controller
 * Clean version with project assignment
 */

const { Diary, Staff, Equipment, Node, Project, Client } = require('../models');
const Joi = require('joi');
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
      dataId: Joi.alternatives().try(Joi.string(), Joi.number()).optional(), 
      costRate: Joi.number().optional(), 
      chargeRate: Joi.number().optional(), 
      position: Joi.object().optional() 
    })).required(),
    photos: Joi.array().items(Joi.string()).optional(),
    voiceNotes: Joi.array().items(Joi.string()).optional(),
    location: Joi.object({
      latitude: Joi.number().optional().allow(null),
      longitude: Joi.number().optional().allow(null),
      timestamp: Joi.alternatives().try(Joi.string(), Joi.number()).optional()
    }).unknown(true).optional().allow(null)
  })).required()
});

const paintDiarySchema = Joi.object({
  date: Joi.date().required(),
  projectId: Joi.alternatives().try(Joi.string().uuid(), Joi.string().allow(null, '')).optional(),
  clientId: Joi.alternatives().try(Joi.string().uuid(), Joi.string().allow(null, '')).optional(),
  canvasData: Joi.any().optional(), // Allow any structure for canvasData
  totalCost: Joi.number().optional().default(0),
  totalRevenue: Joi.number().optional().default(0),
  productivityScore: Joi.number().optional().default(0),
  gpsData: Joi.any().optional().allow(null), // Allow any structure for gpsData
});

// Helper to auto-create resources from diary entries
const processNewDiaryItems = async (canvasData, userId) => {
    if (!canvasData || !canvasData.entries) return canvasData;

    const processedEntries = [];
    for (const entry of canvasData.entries) {
        const processedItems = [];
        for (const item of entry.items || []) {
            // Check if item needs creation (no dataId, or generic ID)
            // 'ai-' is used by frontend AI, 'temp-' or just missing dataId implies new
            const isNew = !item.dataId || String(item.dataId).startsWith('ai-') || String(item.id).startsWith('ai-');
            
            if (isNew) {
                try {
                    let newItem;
                    if (item.type === 'material') {
                        newItem = await Node.create({
                            name: item.name || 'New Material',
                            pricePerUnit: parseFloat(item.costRate) || 0,
                            category: 'material',
                            unit: 'unit',
                            userId
                        });
                    } else if (item.type === 'staff') {
                        newItem = await Staff.create({
                            name: item.name || 'New Staff',
                            role: 'General',
                            payRates: { base: parseFloat(item.costRate) || 0 },
                            chargeRates: { base: parseFloat(item.chargeRate) || 0 },
                            userId
                        });
                    } else if (item.type === 'equipment') {
                        newItem = await Equipment.create({
                            name: item.name || 'New Equipment',
                            costRates: { base: parseFloat(item.costRate) || 0 },
                            chargeRates: { base: parseFloat(item.chargeRate) || 0 },
                            userId
                        });
                    }
                    
                    if (newItem) {
                        item.dataId = newItem.id;
                    }
                } catch (err) {
                    console.error("Auto-create resource failed:", err.message);
                }
            }
            processedItems.push(item);
        }
        processedEntries.push({ ...entry, items: processedItems });
    }
    return { ...canvasData, entries: processedEntries };
};

const getAllPaintDiaries = async (req, res) => {
  try {
    const { date } = req.query;
    const diaries = await Diary.findAll({
          where: { diaryType: 'paint', ...(date && { date }) },
          include: [{ model: Project }, { model: Client }],
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

    const { date, projectId, clientId, canvasData, gpsData } = req.body;

    // 1. Auto-Create Resources
    const processedCanvas = await processNewDiaryItems(canvasData, req.user?.id);

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    if (processedCanvas && processedCanvas.entries) {
      calculatedCosts = await calculateCostsFromEntries(processedCanvas.entries);
    }

    const processedCanvasData = processedCanvas ? processedCanvas.entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    })) : [];

    const diaryData = {
      date,
      projectId,
      clientId,
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

    const { date, projectId, clientId, canvasData, gpsData } = req.body;

    // 1. Auto-Create Resources
    const processedCanvas = await processNewDiaryItems(canvasData, req.user?.id);

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    if (processedCanvas && processedCanvas.entries) {
      calculatedCosts = await calculateCostsFromEntries(processedCanvas.entries);
    }

    const processedCanvasData = processedCanvas ? processedCanvas.entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    })) : [];

    const [updated] = await Diary.update({
      date,
      projectId,
      clientId,
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

    // Auto-Create Resources for partial saves too? Yes.
    const processedCanvas = await processNewDiaryItems({ entries: req.body.entries }, req.user?.id);

    const canvasData = processedCanvas.entries.map(entry => ({
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
  // Try to use the rates provided directly in the item first (most accurate for snapshots)
  if (item.costRate !== undefined) return parseFloat(item.costRate);

  const id = item.dataId || item.data?.id;
  if (!id) return 0;

  try {
    switch (item.type) {
      case 'staff':
        const staff = await Staff.findByPk(id);
        return staff ? parseFloat(staff.payRateBase) : 0;
      case 'equipment':
        const equipment = await Equipment.findByPk(id);
        return equipment ? parseFloat(equipment.costRateBase) : 0;
      case 'material':
        const material = await Node.findByPk(id);
        return material ? parseFloat(material.pricePerUnit) : 0;
      default:
        return 0;
    }
  } catch (err) {
    console.warn(`Error calculating cost for item ${id}:`, err.message);
    return 0;
  }
};

const calculateItemRevenue = async (item) => {
  // Try to use the rates provided directly in the item first
  if (item.chargeRate !== undefined) return parseFloat(item.chargeRate);

  const id = item.dataId || item.data?.id;
  if (!id) return 0;

  try {
    switch (item.type) {
      case 'staff':
        const staff = await Staff.findByPk(id);
        return staff ? parseFloat(staff.chargeOutBase) : 0;
      case 'equipment':
        const equipment = await Equipment.findByPk(id);
        return equipment ? parseFloat(equipment.costRateBase) * 1.2 : 0;
      case 'material':
        const material = await Node.findByPk(id);
        return material ? parseFloat(material.pricePerUnit) * 1.3 : 0;
      default:
        return 0;
    }
  } catch (err) {
    console.warn(`Error calculating revenue for item ${id}:`, err.message);
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
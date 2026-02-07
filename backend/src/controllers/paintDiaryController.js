/*
 * MasterDiaryApp Official - Paint Your Day Diary Controller
 * Clean version with project assignment
 */

const db = require('../models');
const { Diary, Staff, Equipment, Node, Project, Client } = db;
const Joi = require('joi');
const { sequelize } = db;

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
  projectId: Joi.any().allow(null, '').optional(),
  jobId: Joi.any().allow(null, '').optional(),
  clientId: Joi.any().allow(null, '').optional(),
  canvasData: Joi.any().optional(),
  totalCost: Joi.number().optional().default(0),
  totalRevenue: Joi.number().optional().default(0),
  productivityScore: Joi.number().optional().default(0),
  gpsData: Joi.any().optional().allow(null),
});

const getAllPaintDiaries = async (req, res) => {
  try {
    const { date, projectId } = req.query;
    const where = { diaryType: 'paint' };
    if (date) where.date = date;
    if (projectId && projectId !== 'null' && projectId !== 'undefined') {
      where.projectId = projectId;
    }

    const diaries = await Diary.findAll({
      where,
      include: [
        { model: Project, required: false },
        { model: Client, required: false }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(diaries);
  } catch (error) {
    console.error("Error fetching diaries:", error);
    res.status(500).json({ error: error.message });
  }
};

const getPaintDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id, {
      include: [
        { model: Project, required: false },
        { model: Client, required: false }
      ]
    });
    if (diary && diary.diaryType === 'paint') {
      res.json(diary);
    } else {
      res.status(404).json({ error: 'Paint diary entry not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processNewDiaryItems = async (canvasData, userId) => {
  if (!canvasData) return [];
  
  // Normalize canvasData to an array of entries
  let entries = [];
  if (Array.isArray(canvasData)) {
    entries = canvasData;
  } else if (canvasData.entries && Array.isArray(canvasData.entries)) {
    entries = canvasData.entries;
  } else {
    // Single entry or unknown format
    entries = [canvasData];
  }

  const processedEntries = await Promise.all(entries.map(async (entry) => {
    if (!entry.items) return entry;
    
    const processedItems = await Promise.all(entry.items.map(async (item) => {
      // If item has no dataId, or it's a temp AI ID, or marked new -> Create/Link Resource
      const isTempId = !item.dataId || String(item.dataId).startsWith('ai-') || String(item.dataId).startsWith('temp-');
      
      if ((isTempId || item.isNew) && item.name && item.type) {
        try {
          let resource;
          const resourceType = item.type;
          
          if (resourceType === 'staff') {
            resource = await Staff.findOne({ where: { name: item.name, userId } });
            if (!resource) {
              resource = await Staff.create({
                name: item.name,
                role: 'General',
                payRateBase: item.costRate || 25,
                chargeOutBase: item.chargeRate || 35,
                userId
              });
            }
          } else if (resourceType === 'equipment') {
            resource = await Equipment.findOne({ where: { name: item.name, userId } });
            if (!resource) {
              resource = await Equipment.create({
                name: item.name,
                category: 'General',
                ownership: 'owned',
                costRateBase: item.costRate || 50,
                userId
              });
            }
          } else if (resourceType === 'material') {
            resource = await Node.findOne({ where: { name: item.name, userId } });
            if (!resource) {
              resource = await Node.create({
                name: item.name,
                category: 'material',
                unit: 'unit',
                pricePerUnit: item.costRate || 10,
                userId
              });
            }
          }
          
          if (resource) {
            // Return updated item with REAL DB ID
            return { 
                ...item, 
                dataId: resource.id, 
                // data: resource.toJSON ? resource.toJSON() : resource // Optional: update cached data
            };
          }
        } catch (err) {
          console.error(`Error processing new diary item ${item.name}:`, err);
        }
      }
      return item;
    }));
    return { ...entry, items: processedItems };
  }));

  return processedEntries;
};

const createPaintDiary = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, projectId, jobId, clientId, canvasData, gpsData } = req.body;

    // 1. Auto-Create Resources & Normalize Entries
    const entries = await processNewDiaryItems(canvasData, req.user?.id);

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    calculatedCosts = await calculateCostsFromEntries(entries);

    const processedCanvasData = entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    const diaryData = {
      date,
      projectId: projectId || null,
      jobId: jobId || null,
      clientId: clientId || null,
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost || req.body.totalCost || 0,
      totalRevenue: calculatedCosts.totalRevenue || req.body.totalRevenue || 0,
      productivityScore: calculatedCosts.productivityScore || req.body.productivityScore || 0,
      gpsData: gpsData || null,
      diaryType: 'paint'
    };

    const diary = await Diary.create(diaryData, { transaction });
    await transaction.commit();

    // Trigger Workflow Engine
    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('diary.saved', { diary, projectId, userId: req.user?.id });

    res.status(201).json(diary);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Create Paint Diary Error:", error);
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

    const { date, projectId, jobId, clientId, canvasData, gpsData } = req.body;

    // Normalize and process
    const entries = await processNewDiaryItems(canvasData, req.user?.id);

    let calculatedCosts = { totalCost: 0, totalRevenue: 0, productivityScore: 0 };
    calculatedCosts = await calculateCostsFromEntries(entries);

    const processedCanvasData = entries.map(entry => ({
      ...entry,
      photos: entry.photos || [],
      voiceNotes: entry.voiceNotes || [],
      location: entry.location || null
    }));

    await Diary.update({
      date,
      projectId: projectId || null,
      jobId: jobId || null,
      clientId: clientId || null,
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost || req.body.totalCost || 0,
      totalRevenue: calculatedCosts.totalRevenue || req.body.totalRevenue || 0,
      productivityScore: calculatedCosts.productivityScore || req.body.productivityScore || 0,
      gpsData: gpsData || null
    }, { where: { id: req.params.id }, transaction });

    await transaction.commit();
    const updatedDiary = await Diary.findByPk(req.params.id);
    res.json(updatedDiary);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Update Paint Diary Error:", error);
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

  // Fetch markups from settings
  const settings = await db.Settings.findAll();
  const settingsMap = {};
  settings.forEach(s => settingsMap[s.parameter] = s.value);
  
  const materialMarkup = parseFloat(settingsMap.defaultMaterialMarkup) || 1.2;
  const allowanceMarkup = parseFloat(settingsMap.defaultAllowanceMarkup) || 1.2;

  let totalCost = 0;
  let totalRevenue = 0;
  let totalDuration = 0;
  let billableDuration = 0;

  for (const entry of entries) {
    for (const item of entry.items || []) {
      const cost = await calculateItemCost(item);
      const revenue = await calculateItemRevenue(item, { materialMarkup, allowanceMarkup });

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

const calculateItemRevenue = async (item, markups = { materialMarkup: 1.2, allowanceMarkup: 1.2 }) => {
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
        return material ? parseFloat(material.pricePerUnit) * markups.materialMarkup : 0;
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
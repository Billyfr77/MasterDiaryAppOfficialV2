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
  notes: Joi.string().allow(null, '').optional(),
  canvasData: Joi.any().optional(),
  totalCost: Joi.number().optional().default(0),
  totalRevenue: Joi.number().optional().default(0),
  productivityScore: Joi.number().optional().default(0),
  gpsData: Joi.any().optional().allow(null),
});

const getAllPaintDiaries = async (req, res) => {
  try {
    const { date, projectId } = req.query;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const where = { diaryType: 'paint', userId };
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const diary = await Diary.findOne({
      where: { id: req.params.id, userId },
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
  console.log(`[Diary] Attempting Create for User: ${req.user?.id}`);
  const transaction = await sequelize.transaction();

  try {
    const { error } = paintDiarySchema.validate(req.body);
    if (error) {
      console.warn(`[Diary] Validation Failed: ${error.details[0].message}`);
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, projectId, jobId, clientId, canvasData, gpsData, notes } = req.body;
    console.log(`[Diary] Data: Project=${projectId}, Date=${date}, NotesLength=${notes?.length || 0}`);

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
      userId: req.user.id, // Explicitly set from auth
      date,
      projectId: projectId || null,
      jobId: jobId || null,
      clientId: clientId || null,
      notes: notes || '',
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost || req.body.totalCost || 0,
      totalRevenue: calculatedCosts.totalRevenue || req.body.totalRevenue || 0,
      productivityScore: calculatedCosts.productivityScore || req.body.productivityScore || 0,
      gpsData: gpsData || null,
      diaryType: 'paint'
    };

    const diary = await Diary.create(diaryData, { transaction });
    await transaction.commit();
    console.log(`[Diary] Successfully Saved! ID: ${diary.id}`);

    // TRIGGER SENTINEL REVENUE RECOVERY (Military Grade Deduplication Active)
    const sentinelService = require('../services/sentinelService');
    sentinelService.processDiary(diary.id, req.user.id);

    // Trigger Workflow Engine
    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('diary.saved', { diary, projectId, userId: req.user?.id });

    res.status(201).json(diary);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("[Diary] FATAL SAVE ERROR:", error);
    res.status(500).json({ error: "Internal Database Failure during Save.", details: error.message });
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

    const { date, projectId, jobId, clientId, canvasData, gpsData, notes } = req.body;

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
      notes: notes || null,
      canvasData: processedCanvasData,
      totalCost: calculatedCosts.totalCost || req.body.totalCost || 0,
      totalRevenue: calculatedCosts.totalRevenue || req.body.totalRevenue || 0,
      productivityScore: calculatedCosts.productivityScore || req.body.productivityScore || 0,
      gpsData: gpsData || null
    }, { where: { id: req.params.id }, transaction });

    await transaction.commit();
    const updatedDiary = await Diary.findByPk(req.params.id);

    // TRIGGER SENTINEL REVENUE RECOVERY (Military Grade Deduplication Active)
    const sentinelService = require('../services/sentinelService');
    sentinelService.processDiary(updatedDiary.id, req.user.id);

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

    const diaryId = existingDiary.id;
    const deleted = await Diary.destroy({ where: { id: diaryId } });
    
    if (deleted) {
      // PROACTIVE CLEANUP: Remove any unread sentinel alerts for this diary
      const { Notification } = require('../models');
      await Notification.destroy({
          where: {
              type: 'sentinel_alert',
              data: {
                  [db.Sequelize.Op.like]: `%${diaryId}%`
              }
          }
      });

      res.json({ message: 'Paint diary entry and associated alerts deleted' });
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
      const rateCost = await calculateItemCost(item);
      const rateRevenue = await calculateItemRevenue(item, { materialMarkup, allowanceMarkup });

      // Match frontend multiplier logic
      const multiplier = (item.type === 'staff' || item.type === 'equipment')
        ? (item.duration || item.quantity || 1)
        : (item.quantity || 1);

      totalCost += rateCost * multiplier;
      totalRevenue += rateRevenue * multiplier;
      totalDuration += multiplier;

      if (item.type === 'staff' || item.type === 'equipment') {
        billableDuration += multiplier;
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
        // Frontend uses materialMarkup for non-staff if no chargeRate
        return equipment ? parseFloat(equipment.costRateBase) * markups.materialMarkup : 0;
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
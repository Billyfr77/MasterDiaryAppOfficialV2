require('dotenv').config();  
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
 */
const { Project, Client, MapAsset, Allocation, Diary, Quote, Document, SafetyForm } = require('../models');
const Joi = require('joi');
const axios = require('axios');

  const projectSchema = Joi.object({
          name: Joi.string().min(1).required(),
          client: Joi.string().allow('').optional(),
          clientId: Joi.string().guid().optional().allow(null),
          site: Joi.string().min(1).required(),
          status: Joi.string().valid('active', 'completed', 'on-hold', 'cancelled').optional(),
          value: Joi.number().min(0).optional(), // Changed from estimatedValue to value
          description: Joi.string().allow('').optional(),
          startDate: Joi.date().iso().optional().allow(null),
          endDate: Joi.date().iso().optional().allow(null),
          latitude: Joi.number().min(-90).max(90).optional().allow(null),
          longitude: Joi.number().min(-180).max(180).optional().allow(null)
        });

// Helper to attach financial calculations
const attachFinancials = (project) => {
  const p = project.toJSON ? project.toJSON() : project;

  // 1. Contract Value (Handle strings, nulls, etc)
  const contractValue = p.value ? parseFloat(p.value) : 0;

  // Handle associations (check both cases)
  const quotes = p.quotes || p.Quotes || [];
  const diaries = p.Diaries || p.diaries || [];

  // 2. Variations (Approved Quotes)
  const variationsValue = quotes
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);

  // 2b. Potential Variations (All Quotes)
  const allQuotesValue = quotes
    .reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);

  // 3. Live Price (Contract + Approved Variations)
  const livePrice = contractValue + variationsValue;

  // 3b. Potential Price (Contract + All Variations)
  const potentialPrice = contractValue + allQuotesValue;

  // 4. Total Cost (Diaries)
  const totalCost = diaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);

  // 5. Total Diary Revenue (Charge Out)
  const totalDiaryRevenue = diaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);

  // 6. Project Profit (Contract - Cost)
  const profit = livePrice - totalCost;

  // 7. Operational Profit (Diary Revenue - Diary Cost)
  const operationalProfit = totalDiaryRevenue - totalCost;

  return {
    ...p,
    financials: {
      contractValue,
      variationsValue,
      livePrice,
      potentialPrice,
      totalCost,
      totalDiaryRevenue,
      profit,
      operationalProfit,
      isProfitable: profit >= 0
    }
  };
};

const getAllProjects = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching projects for user: ${req.user?.id}`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where: req.user ? { userId: req.user?.id || null } : {},
      include: [
        { model: Client, as: 'clientDetails', required: false },
        { 
          model: Quote, 
          as: 'quotes', 
          // Removed 'where: approved' to fetch ALL quotes for potential value calc
          required: false 
        },
        { 
          model: Diary, 
          attributes: ['totalCost', 'totalRevenue'], // Ensure revenue is fetched
          required: false 
        }
      ],
      distinct: true, // Ensure correct count with includes
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Calculate Financials for each project
    const enhancedRows = rows.map(attachFinancials);

    res.json({
      data: enhancedRows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/projects:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'GET /api/projects',
      timestamp: new Date().toISOString()
    });
  }
};

const getProjectById = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching project ${req.params.id} for user: ${req.user?.id}`);
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user?.id || null },
      include: [
        { model: Client, as: 'clientDetails', required: false },
        { model: Quote, as: 'quotes', required: false },
        { model: Diary, required: false },
        { model: Document, as: 'documents', required: false },
        { model: SafetyForm, as: 'safetyForms', required: false },
        { model: Allocation, required: false }
      ]
    });

    if (project) {
      const enhancedProject = attachFinancials(project);
      res.json(enhancedProject);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /api/projects/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `GET /api/projects/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const createProject = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Creating project:`, req.body, 'for user:', req.user?.id);
  try {
    const { error, value } = projectSchema.validate(req.body); // Use validated value
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const project = await Project.create({
      ...value,
      userId: req.user?.id || null
    });
    
    // Attach default financials (will be 0 except for contract value)
    const enhancedProject = attachFinancials(project);
    res.status(201).json(enhancedProject);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /api/projects:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: 'POST /api/projects',
      timestamp: new Date().toISOString()
    });
  }
};

const updateProject = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Updating project ${req.params.id}:`, req.body, 'for user:', req.user?.id);
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Project.update(value, { where: { id: req.params.id, userId: req.user?.id || null } });
    if (updated) {
      // Re-fetch with associations to calculate financials correctly
      const updatedProject = await Project.findByPk(req.params.id, {
        include: [
            { model: Client, as: 'clientDetails', required: false },
            { model: Quote, as: 'quotes', required: false },
            { model: Diary, required: false }
        ]
      });
      const enhancedProject = attachFinancials(updatedProject);
      res.json(enhancedProject);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PUT /api/projects/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `PUT /api/projects/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const deleteProject = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Deleting project ${req.params.id} for user: ${req.user?.id}`);
  try {
    const projectId = req.params.id;
    const userId = req.user?.id || null;

    // Verify project exists and user has access
    const project = await Project.findOne({ where: { id: projectId, userId } });
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    // Manual Cascade Delete
    // We delete related records first to satisfy Foreign Key constraints
    await Promise.all([
        MapAsset.destroy({ where: { projectId } }),
        Allocation.destroy({ where: { projectId } }),
        Diary.destroy({ where: { projectId } }),
        Quote.destroy({ where: { projectId } }),
        // Document uses 'relatedId' for polymorphic association, check model to confirm but usually strict FK isn't there, good to clean anyway
        Document.destroy({ where: { relatedId: projectId } }) 
    ]);

    const deleted = await Project.destroy({ where: { id: projectId } });
    
    if (deleted) {
      res.json({ message: 'Project and all associated data deleted' });
    } else {
      res.status(404).json({ error: 'Project could not be deleted' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /api/projects/${req.params.id}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `DELETE /api/projects/${req.params.id}`,
      timestamp: new Date().toISOString()
    });
  }
};

const geocodeProject = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Geocoding project ${req.params.id} for user: ${req.user?.id}`);
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: req.user?.id || null } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (!project.site) {
      return res.status(400).json({ error: 'Project has no site address to geocode' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: project.site,
        key: process.env.GOOGLE_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      await project.update({
        latitude: location.lat,
        longitude: location.lng
      });
      res.json(project);
    } else {
      res.status(400).json({ error: `Geocoding failed: ${response.data.status}` });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in geocoding project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error during geocoding' });
  }
};

const addProjectDocument = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, type, content, url } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const doc = await Document.create({
      title,
      type: type || 'REPORT',
      content: url || content, // Store URL in content if it's a file, or text content
      relatedModel: 'Project',
      relatedId: projectId,
      userId: req.user.id,
      status: 'FINAL',
      metadata: { url } // Also store URL in metadata for explicit access
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProjectMapStats = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const projects = await Project.findAll({
            where: userId ? { userId } : {},
            include: [
                { model: Client, as: 'clientDetails', required: false },
                { model: Quote, as: 'quotes', required: false },
                { model: Diary, required: false },
                {
                    model: Allocation,
                    attributes: ['resourceType', 'startDate', 'endDate'],
                    required: false
                }
            ]
        });

        const today = new Date().toISOString().split('T')[0];

        const stats = projects.map(p => {
            // Use shared helper for financial consistency
            const financialData = attachFinancials(p).financials;
            
            // Calc Resources (Active Today)
            const activeAllocations = p.Allocations?.filter(a => a.startDate <= today && a.endDate >= today) || [];
            const staffCount = activeAllocations.filter(a => a.resourceType === 'staff').length;
            const equipCount = activeAllocations.filter(a => a.resourceType === 'equipment').length;

            return {
                id: p.id,
                value: financialData.contractValue, // Contract Estimated Value
                livePrice: financialData.livePrice,
                potentialPrice: financialData.potentialPrice, // Contract + All Quotes
                cost: financialData.totalCost,
                diaryRevenue: financialData.totalDiaryRevenue, // Add Charge Out
                profit: financialData.profit,
                isProfitable: financialData.isProfitable,
                staffCount,
                equipCount
            };
        });

        res.json(stats);
    } catch (error) {
        console.error("Error fetching map stats:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  geocodeProject,
  getProjectMapStats,
  addProjectDocument
};

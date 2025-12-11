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
const { Project, Client, MapAsset, Allocation, Diary, Quote, Document } = require('../models');
const Joi = require('joi');
const axios = require('axios');

  const projectSchema = Joi.object({
          name: Joi.string().min(1).required(),
          client: Joi.string().allow('').optional(),
          clientId: Joi.string().guid().optional().allow(null),
          site: Joi.string().min(1).required(),
          status: Joi.string().valid('active', 'completed', 'on-hold', 'cancelled').optional(),
          estimatedValue: Joi.number().min(0).optional(),
          description: Joi.string().allow('').optional(),
          startDate: Joi.date().iso().optional().allow(null),
          endDate: Joi.date().iso().optional().allow(null),
          latitude: Joi.number().min(-90).max(90).optional().allow(null),
          longitude: Joi.number().min(-180).max(180).optional().allow(null)
        });

const getAllProjects = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching projects for user: ${req.user?.id}`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      where: req.user ? { userId: req.user?.id || null } : {},
      include: [{ model: Client, as: 'clientDetails', required: false }],
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
      include: [{ model: Client, as: 'clientDetails', required: false }]
    });
    if (project) {
      res.json(project);
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
    res.status(201).json(project);
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
      const updatedProject = await Project.findByPk(req.params.id, {
        include: [{ model: Client, as: 'clientDetails', required: false }]
      });
      res.json(updatedProject);
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

const getProjectMapStats = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const projects = await Project.findAll({
            where: userId ? { userId } : {},
            include: [
                { 
                    model: Diary,
                    attributes: ['totalRevenue', 'totalCost']
                },
                {
                    model: Allocation,
                    attributes: ['resourceType', 'startDate', 'endDate'],
                    required: false
                }
            ]
        });

        const today = new Date().toISOString().split('T')[0];

        const stats = projects.map(p => {
            // Calc Financials
            const revenue = p.Diaries?.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0) || 0;
            const cost = p.Diaries?.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0) || 0;
            
            // Calc Resources (Active Today)
            const activeAllocations = p.Allocations?.filter(a => a.startDate <= today && a.endDate >= today) || [];
            const staffCount = activeAllocations.filter(a => a.resourceType === 'staff').length;
            const equipCount = activeAllocations.filter(a => a.resourceType === 'equipment').length;

            return {
                id: p.id,
                revenue,
                cost,
                margin: revenue - cost,
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
  getProjectMapStats
};

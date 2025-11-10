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
 */const { Project } = require('../models');
const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().min(1).required(),
  site: Joi.string().min(1).required()
});

const getAllProjects = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching projects for user: ${req.user?.id}`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
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
      where: { id: req.params.id, userId: req.user.id }
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
    const { error } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const project = await Project.create({
      ...req.body,
      userId: req.user.id
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
    const { error } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Project.update(req.body, { where: { id: req.params.id, userId: req.user.id } });
    if (updated) {
      const updatedProject = await Project.findByPk(req.params.id);
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
    const deleted = await Project.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (deleted) {
      res.json({ message: 'Project deleted' });
    } else {
      res.status(404).json({ error: 'Project not found' });
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

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
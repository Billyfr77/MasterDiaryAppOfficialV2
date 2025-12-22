const { DiaryTemplate, Project, Sequelize } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const templateSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().valid('full-day', 'node-group').default('node-group'),
  description: Joi.string().allow('').optional(),
  category: Joi.string().default('General'),
  tags: Joi.array().items(Joi.string()).default([]),
  preview: Joi.object().optional(),
  data: Joi.object({
    items: Joi.array().required(),
    extraNodes: Joi.array().required(),
    edges: Joi.array().required()
  }).required(),
  projectId: Joi.string().uuid().allow(null).optional(),
  isPublic: Joi.boolean().default(false)
});

const getAllTemplates = async (req, res) => {
  try {
    const { projectId, type, search, category } = req.query;
    // Allow seeing public templates or user's own templates
    const where = {
      [Op.or]: [
        { userId: req.user.id },
        { isPublic: true }
      ]
    };
    
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (category) where.category = category;
    
    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
          ]
        }
      ];
    }

    const templates = await DiaryTemplate.findAll({
      where,
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await DiaryTemplate.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const incrementUsage = async (req, res) => {
  try {
    const template = await DiaryTemplate.findByPk(req.params.id);
    if (template) {
      await template.increment('usageCount');
      res.json({ success: true, usageCount: template.usageCount + 1 });
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { error, value } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const template = await DiaryTemplate.create({
      ...value,
      userId: req.user.id,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      projectId: value.projectId || null,
      version: 1,
      usageCount: 0
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { error, value } = templateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const template = await DiaryTemplate.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    await template.update({
      ...value,
      version: template.version + 1
    });

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const deleted = await DiaryTemplate.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (deleted) {
      res.json({ message: 'Template deleted successfully' });
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage
};

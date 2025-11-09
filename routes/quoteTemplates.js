const express = require('express')
const router = express.Router()
const { QuoteTemplate } = require('../models')
const { authenticateToken } = require('../middleware/auth')

// Get all templates (public and user's own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await QuoteTemplate.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { createdBy: req.user.id },
          { isPublic: true }
        ]
      },
      order: [['createdAt', 'DESC']]
    })
    res.json({ data: templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// Create a new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, templateData, category, isPublic } = req.body
    const template = await QuoteTemplate.create({
      name,
      description,
      templateData,
      category,
      createdBy: req.user.id,
      isPublic: isPublic || false
    })
    res.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
})

// Update a template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, templateData, category, isPublic } = req.body

    const template = await QuoteTemplate.findOne({
      where: { id, createdBy: req.user.id }
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    await template.update({
      name,
      description,
      templateData,
      category,
      isPublic
    })

    res.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})

// Delete a template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const template = await QuoteTemplate.findOne({
      where: { id, createdBy: req.user.id }
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    await template.destroy()
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

module.exports = router
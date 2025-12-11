const { Allocation, Project, Staff, Equipment } = require('../models');
const { Op } = require('sequelize');

const getAllocations = async (req, res) => {
  try {
    const { start, end, projectId } = req.query;
    
    const where = {};
    if (start && end) {
      where.startDate = { [Op.lte]: end };
      where.endDate = { [Op.gte]: start };
    }
    if (projectId) where.projectId = projectId;

    const allocations = await Allocation.findAll({
      where,
      include: [
        { model: Project },
        { model: Staff, as: 'staffResource' },
        { model: Equipment, as: 'equipmentResource' }
      ]
    });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.create(req.body);
    const fullAllocation = await Allocation.findByPk(allocation.id, {
      include: [
        { model: Project },
        { model: Staff, as: 'staffResource' },
        { model: Equipment, as: 'equipmentResource' }
      ]
    });
    res.status(201).json(fullAllocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Allocation.update(req.body, { where: { id } });
    if (updated) {
      const updatedAllocation = await Allocation.findByPk(id, {
        include: [
          { model: Project },
          { model: Staff, as: 'staffResource' },
          { model: Equipment, as: 'equipmentResource' }
        ]
      });
      res.json(updatedAllocation);
    } else {
      res.status(404).json({ error: 'Allocation not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Allocation.destroy({ where: { id } });
    if (deleted) res.json({ message: 'Allocation deleted' });
    else res.status(404).json({ error: 'Allocation not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation
};

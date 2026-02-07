const { Allocation, Project, Staff, Equipment, sequelize } = require('../models');
const { Op } = require('sequelize');

const getAllocations = async (req, res) => {
  try {
    const { start, end, projectId } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // BACKWARD COMPATIBILITY: Sync userId for legacy allocations if they belong to a project owned by this user
    try {
        const table = sequelize.getDialect() === 'postgres' ? '"Projects"' : 'Projects';
        await Allocation.update({ userId }, {
            where: {
                userId: null,
                projectId: {
                    [Op.and]: [
                        { [Op.not]: null },
                        { [Op.in]: sequelize.literal(`(SELECT id FROM ${table} WHERE "userId" = '${userId}')`) }
                    ]
                }
            }
        });
    } catch (syncErr) {
        console.warn("[AllocationSync] Legacy sync failed:", syncErr.message);
    }

    const where = { userId }; // Use userId directly on Allocation
    if (start && end) {
      where.startDate = { [Op.lte]: end };
      where.endDate = { [Op.gte]: start };
    }
    if (projectId) where.projectId = projectId;

    const allocations = await Allocation.findAll({
      where,
      include: [
        { 
          model: Project, 
          required: false 
        },
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify project belongs to user
    if (req.body.projectId) {
      const project = await Project.findOne({ where: { id: req.body.projectId, userId } });
      if (!project) return res.status(403).json({ error: 'Unauthorized project' });
    }

    const allocation = await Allocation.create({ ...req.body, userId });
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify allocation belongs to user
    const allocation = await Allocation.findOne({
        where: { id, userId }
    });

    if (!allocation) return res.status(404).json({ error: 'Allocation not found or unauthorized' });

    await allocation.update(req.body);
    
    const updatedAllocation = await Allocation.findByPk(id, {
      include: [
        { model: Project },
        { model: Staff, as: 'staffResource' },
        { model: Equipment, as: 'equipmentResource' }
      ]
    });
    res.json(updatedAllocation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify allocation belongs to user
    const allocation = await Allocation.findOne({
        where: { id, userId }
    });

    if (!allocation) return res.status(404).json({ error: 'Allocation not found or unauthorized' });

    await allocation.destroy();
    res.json({ message: 'Allocation deleted' });
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

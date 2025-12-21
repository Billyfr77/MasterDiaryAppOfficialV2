const { Job } = require('../models');
const { Op } = require('sequelize');

const getAllJobs = async (req, res) => {
  try {
    const { start, end, projectId } = req.query;
    const where = {};
    
    // Date filtering if provided
    if (start && end) {
        where.date = { [Op.between]: [start, end] };
    }

    if (projectId) {
        where.projectId = projectId;
    }

    const jobs = await Job.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(400).json({ error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Job.update(req.body, { where: { id } });
    if (updated) {
      const updatedJob = await Job.findByPk(id);
      res.json(updatedJob);
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(400).json({ error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Job.destroy({ where: { id } });
    if (deleted) res.json({ message: 'Job deleted' });
    else res.status(404).json({ error: 'Job not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob
};

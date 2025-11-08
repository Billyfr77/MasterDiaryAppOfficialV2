const { Staff } = require('../models');
const Joi = require('joi');

const staffSchema = Joi.object({
  name: Joi.string().min(1).required(),
  role: Joi.string().min(1).required(),
  payRateBase: Joi.number().positive().required(),
  payRateOT1: Joi.number().positive().optional(),
  payRateOT2: Joi.number().positive().optional(),
  chargeOutBase: Joi.number().positive().required(),
  chargeOutOT1: Joi.number().positive().optional(),
  chargeOutOT2: Joi.number().positive().optional()
});

const getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Staff.findAndCountAll({
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
    res.status(500).json({ error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staffMember = await Staff.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (staffMember) {
      res.json(staffMember);
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { error } = staffSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const staffMember = await Staff.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(staffMember);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { error } = staffSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const [updated] = await Staff.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    if (updated) {
      const updatedStaff = await Staff.findByPk(req.params.id);
      res.json(updatedStaff);
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deleted) {
      res.json({ message: 'Staff member deleted' });
    } else {
      res.status(404).json({ error: 'Staff member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
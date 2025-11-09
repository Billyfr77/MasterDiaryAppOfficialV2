const { Diary, Project, Staff } = require('../models');
const Joi = require('joi');
const moment = require('moment');
const { sequelize } = require('../models');
const { getSetting } = require('../utils/settingsCache');

const diarySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  projectId: Joi.string().uuid().required(),
  workerId: Joi.string().uuid().required(),
  start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  finish: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  breakMins: Joi.number().integer().min(0).optional(),
  revenues: Joi.number().positive().optional()
}).custom((value, helpers) => {
  const start = moment(value.start, 'HH:mm');
  const finish = moment(value.finish, 'HH:mm');
  if (start.isSameOrAfter(finish)) {
    return helpers.error('any.invalid', { message: 'Start time must be before finish time' });
  }
  return value;
});

const getAllDiaries = async (req, res) => {
  try {
    const { date, projectId } = req.query;
    const where = {};
    if (date) where.date = date;
    if (projectId) where.projectId = projectId;

    const diaries = await Diary.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'Project',
          where: { userId: req.user.id },
          required: true
        },
        { model: Staff, as: 'Staff' }
      ],
      order: [['date', 'DESC']]
    });
    res.json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'Project',
          where: { userId: req.user.id },
          required: true
        },
        { model: Staff, as: 'Staff' }
      ]
    });
    if (diary) {
      res.json(diary);
    } else {
      res.status(404).json({ error: 'Diary entry not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDiary = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { error } = diarySchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({ error: error.details[0].message });
    }

    const { date, projectId, workerId, start, finish, breakMins, revenues } = req.body;

    // Check if project belongs to user
    const project = await Project.findOne({
      where: { id: projectId, userId: req.user.id },
      transaction
    });
    if (!project) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Project not found or access denied' });
    }

    // Fetch staff
    const staff = await Staff.findByPk(workerId, { transaction });
    if (!staff) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Fetch settings from cache
    const ordinaryHours = parseFloat(getSetting('ordinaryHours', '8'));
    const markup = parseFloat(getSetting('markup', '20')); // %
    if (isNaN(ordinaryHours)) ordinaryHours = 8;
    if (isNaN(markup)) markup = 20;

    // Calculate totalHours
    const startTime = moment(start, 'HH:mm');
    const finishTime = moment(finish, 'HH:mm');
    const totalMinutes = finishTime.diff(startTime, 'minutes');
    const totalHours = totalMinutes / 60 - (breakMins || 0) / 60;

    // Calculate hours breakdown
    const ordinaryHoursCalc = Math.min(totalHours, ordinaryHours);
    const ot1Hours = Math.min(Math.max(totalHours - ordinaryHours, 0), 4); // Assume OT1 up to 4 hours
    const ot2Hours = Math.max(totalHours - ordinaryHours - 4, 0);

    // Calculate costs
    const costs = ordinaryHoursCalc * staff.payRateBase +
                  ot1Hours * (staff.payRateOT1 || staff.payRateBase) +
                  ot2Hours * (staff.payRateOT2 || staff.payRateBase);

    // Calculate revenues using charge out rates
    const revenuesCalc = revenues || (
      ordinaryHoursCalc * staff.chargeOutBase +
      ot1Hours * (staff.chargeOutOT1 || staff.chargeOutBase) +
      ot2Hours * (staff.chargeOutOT2 || staff.chargeOutBase)
    );

    const marginPct = revenuesCalc > 0 ? ((revenuesCalc - costs) / revenuesCalc) * 100 : 0;

    const diaryData = {
      date,
      projectId,
      workerId,
      start,
      finish,
      breakMins: breakMins || 0,
      totalHours,
      ordinaryHours: ordinaryHoursCalc,
      ot1Hours,
      ot2Hours,
      costs,
      revenues: revenuesCalc,
      marginPct
    };

    const diary = await Diary.create(diaryData, { transaction });
    await transaction.commit();

    // Fetch full entry
    const fullDiary = await Diary.findByPk(diary.id, {
      include: [
        { model: Project, as: 'Project' },
        { model: Staff, as: 'Staff' }
      ]
    });

    res.status(201).json(fullDiary);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

const updateDiary = async (req, res) => {
  try {
    // First check if diary exists and belongs to user's project
    const existingDiary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!existingDiary) {
      return res.status(404).json({ error: 'Diary entry not found or access denied' });
    }

    const [updated] = await Diary.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedDiary = await Diary.findByPk(req.params.id);
      res.json(updatedDiary);
    } else {
      res.status(404).json({ error: 'Diary entry not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDiary = async (req, res) => {
  try {
    // First check if diary exists and belongs to user's project
    const existingDiary = await Diary.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'Project',
        where: { userId: req.user.id }
      }]
    });

    if (!existingDiary) {
      return res.status(404).json({ error: 'Diary entry not found or access denied' });
    }

    const deleted = await Diary.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Diary entry deleted' });
    } else {
      res.status(404).json({ error: 'Diary entry not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDiaries,
  getDiaryById,
  createDiary,
  updateDiary,
  deleteDiary
};
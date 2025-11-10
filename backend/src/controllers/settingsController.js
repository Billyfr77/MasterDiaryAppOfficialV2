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
 */const { Settings } = require('../models');
const { getSetting, setSetting, reloadSettings } = require('../utils/settingsCache');

// Placeholder admin check middleware
const isAdmin = (req, res, next) => {
  // TODO: Implement proper authentication
  // For now, assume all requests are admin
  next();
};

const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSettingById = async (req, res) => {
  try {
    const setting = await Settings.findByPk(req.params.id);
    if (setting) {
      res.json(setting);
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSetting = async (req, res) => {
  try {
    const setting = await Settings.create(req.body);
    setSetting(setting.parameter, setting.value);
    res.status(201).json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const [updated] = await Settings.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedSetting = await Settings.findByPk(req.params.id);
      setSetting(updatedSetting.parameter, updatedSetting.value);
      res.json(updatedSetting);
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSetting = async (req, res) => {
  try {
    const setting = await Settings.findByPk(req.params.id);
    if (setting) {
      setSetting(setting.parameter, undefined); // Remove from cache
    }
    const deleted = await Settings.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Setting deleted' });
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  isAdmin,
  getAllSettings,
  getSettingById,
  createSetting,
  updateSetting,
  deleteSetting
};
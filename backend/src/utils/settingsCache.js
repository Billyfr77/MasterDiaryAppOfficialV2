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

let settingsCache = new Map();

const loadSettings = async () => {
  try {
    const settings = await Settings.findAll();
    settings.forEach(setting => {
      settingsCache.set(setting.parameter, setting.value);
    });
    console.log('Settings cached:', Object.fromEntries(settingsCache));
  } catch (error) {
    console.error('Error loading settings cache:', error);
  }
};

const getSetting = (parameter, defaultValue = null) => {
  return settingsCache.get(parameter) || defaultValue;
};

const setSetting = (parameter, value) => {
  settingsCache.set(parameter, value);
};

const reloadSettings = async () => {
  settingsCache.clear();
  await loadSettings();
};

module.exports = {
  loadSettings,
  getSetting,
  setSetting,
  reloadSettings
};

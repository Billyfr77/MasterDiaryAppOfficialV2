const { Settings } = require('../models');

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
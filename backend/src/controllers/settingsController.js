const db = require('../models');
const Setting = db.Settings; // Ensure model name matches exactly (Settings vs Setting)

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { parameter, value, notes } = req.body;
    const setting = await Setting.create({ parameter, value, notes });
    res.status(201).json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// New Upsert Logic
exports.upsertSetting = async (req, res) => {
  try {
    const { parameter, value, notes } = req.body;
    const [setting, created] = await Setting.findOrCreate({
      where: { parameter },
      defaults: { value, notes }
    });

    if (!created) {
      setting.value = value;
      if (notes) setting.notes = notes;
      await setting.save();
    }

    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Setting.update(req.body, { where: { id } });
    if (updated) {
      const updatedSetting = await Setting.findByPk(id);
      res.json(updatedSetting);
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Setting.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

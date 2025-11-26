const { MapAsset } = require('../models');

// GET all map assets (optionally filtered by Project ID)
const getMapAssets = async (req, res) => {
  try {
    const { projectId } = req.query;
    const whereClause = projectId ? { projectId } : {};
    
    const assets = await MapAsset.findAll({ where: whereClause });
    res.json(assets);
  } catch (error) {
    console.error("Error fetching map assets:", error);
    res.status(500).json({ error: 'Failed to fetch map assets' });
  }
};

// POST create a new map asset
const createMapAsset = async (req, res) => {
  try {
    const { projectId, type, coordinates, properties, geometryType, name } = req.body;
    
    const newAsset = await MapAsset.create({
      projectId,
      type,
      name: name || type,
      geometryType: geometryType || 'POINT',
      coordinates,
      properties,
      createdBy: req.user ? req.user.id : null
    });

    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating map asset:", error);
    res.status(500).json({ error: 'Failed to save map asset' });
  }
};

// PUT update an asset (e.g., dragging it to a new location)
const updateMapAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates, properties, status, name, type } = req.body;

    const asset = await MapAsset.findByPk(id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (coordinates) asset.coordinates = coordinates;
    if (status) asset.status = status;
    if (name) asset.name = name;
    if (type) asset.type = type;
    
    // Deep merge properties to avoid losing existing metadata
    if (properties) {
        asset.properties = { ...asset.properties, ...properties };
    }

    await asset.save();
    res.json(asset);
  } catch (error) {
    console.error("Error updating map asset:", error);
    res.status(500).json({ error: 'Failed to update map asset' });
  }
};

// DELETE remove an asset
const deleteMapAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await MapAsset.destroy({ where: { id } });
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error("Error deleting map asset:", error);
    res.status(500).json({ error: 'Failed to delete map asset' });
  }
};

module.exports = {
  getMapAssets,
  createMapAsset,
  updateMapAsset,
  deleteMapAsset
};

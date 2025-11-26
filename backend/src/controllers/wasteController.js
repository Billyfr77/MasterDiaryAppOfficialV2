const { WasteManifest, Project } = require('../models');
const { Op } = require('sequelize');

// Create a new waste docket
const createManifest = async (req, res) => {
  try {
    const { projectId, wasteType, quantity, unit, destinationSite, truckId, driverName } = req.body;
    
    // Generate Ticket # (Simple timestamp based for now, could be sequential)
    const ticketNumber = `W-${Date.now().toString().slice(-6)}`;

    const manifest = await WasteManifest.create({
      ticketNumber,
      projectId,
      wasteType,
      quantity,
      unit,
      destinationSite,
      truckId,
      driverName,
      status: 'Loaded'
    });

    res.status(201).json(manifest);
  } catch (error) {
    console.error("Create Manifest Error:", error);
    res.status(500).json({ error: 'Failed to create manifest' });
  }
};

// Update status (e.g., when dumping)
const updateManifestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tippingFee } = req.body;
    
    const manifest = await WasteManifest.findByPk(id);
    if (!manifest) return res.status(404).json({ error: 'Manifest not found' });

    manifest.status = status;
    if (status === 'Disposed') {
        manifest.disposalTime = new Date();
    }
    if (tippingFee) {
        manifest.tippingFee = tippingFee;
    }

    await manifest.save();
    res.json(manifest);
  } catch (error) {
    console.error("Update Manifest Error:", error);
    res.status(500).json({ error: 'Failed to update manifest' });
  }
};

// Get project waste stats
const getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const manifests = await WasteManifest.findAll({ where: { projectId } });
    
    const totalTonnage = manifests.reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0);
    const totalCost = manifests.reduce((sum, m) => sum + parseFloat(m.tippingFee || 0), 0);
    const breakdown = {};
    
    manifests.forEach(m => {
        breakdown[m.wasteType] = (breakdown[m.wasteType] || 0) + parseFloat(m.quantity);
    });

    res.json({ totalTonnage, totalCost, breakdown, manifestCount: manifests.length });
  } catch (error) {
    console.error("Waste Stats Error:", error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

const getAllManifests = async (req, res) => {
    try {
        const manifests = await WasteManifest.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(manifests);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { createManifest, updateManifestStatus, getProjectStats, getAllManifests };

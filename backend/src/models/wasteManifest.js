const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WasteManifest = sequelize.define('WasteManifest', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    truckId: {
      type: DataTypes.STRING, // Can be asset ID or Rego
      allowNull: true
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wasteType: {
      type: DataTypes.STRING, // e.g., 'Concrete', 'Soil', 'General', 'Hazmat'
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Tonnage or Cubic Meters'
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'Tonnes'
    },
    destinationSite: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Loaded', // Loaded, In Transit, Disposed, Rejected
      validate: {
        isIn: [['Loaded', 'In Transit', 'Disposed', 'Rejected']]
      }
    },
    disposalTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return WasteManifest;
};

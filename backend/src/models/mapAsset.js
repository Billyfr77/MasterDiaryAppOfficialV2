const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MapAsset = sequelize.define('MapAsset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Global assets if null, or specific to a project
      comment: 'Linked Project ID'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., crane, excavator, zone, hazard, material'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Geo-spatial data stored as JSON for SQLite compatibility (PostGIS would be better for Prod)
    geometryType: {
      type: DataTypes.STRING,
      defaultValue: 'POINT', // POINT, POLYGON, LINESTRING
      comment: 'The shape type'
    },
    coordinates: {
      type: DataTypes.JSON, // Stores {lat, lng} for POINT or [{lat,lng},...] for POLYGON
      allowNull: false
    },
    properties: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Metadata: rotation, radius, status, color, etc.'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  return MapAsset;
};

module.exports = (sequelize, DataTypes) => {
  const QuoteTemplate = sequelize.define('QuoteTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    templateData: {
      type: DataTypes.JSON,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  })

  QuoteTemplate.associate = (models) => {
    QuoteTemplate.belongsTo(models.User, { foreignKey: 'createdBy' })
  }

  return QuoteTemplate
}
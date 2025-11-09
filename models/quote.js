module.exports = (sequelize, DataTypes) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    marginPct: {
      type: DataTypes.FLOAT,
      defaultValue: 20
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {})

  Quote.associate = (models) => {
    Quote.belongsTo(models.Project, { foreignKey: 'projectId' })
  }

  return Quote
}
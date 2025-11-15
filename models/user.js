const { DataTypes } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  User.associate = function(db) {
    User.hasMany(db.Project, { foreignKey: 'userId', allowNull: true })
    User.hasMany(db.Staff, { foreignKey: 'userId', allowNull: true })
    User.hasMany(db.Equipment, { foreignKey: 'userId', allowNull: true })
    User.hasMany(db.Diary, { foreignKey: 'userId', allowNull: true })
    User.hasMany(db.Node, { foreignKey: 'userId', allowNull: true })
  }

  return User
}
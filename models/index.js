const { Sequelize } = require('sequelize')
const config = require('../config/config.json').development

const sequelize = new Sequelize(config.database || config.storage, config.username, config.password, config)

const db = {}

// Import models
const User = require('./user.js')
const Project = require('./project.js')
const Staff = require('./staff.js')
const Equipment = require('./equipment.js')
const Diary = require('./diary.js')
const Settings = require('./settings.js')
const ProjectUser = require('./projectUser.js')
const Subscription = require('./subscription.js')

// Add models to db object
db.User = User(sequelize, Sequelize.DataTypes)
db.Project = Project(sequelize, Sequelize.DataTypes)
db.Staff = Staff(sequelize, Sequelize.DataTypes)
db.Equipment = Equipment(sequelize, Sequelize.DataTypes)
db.Diary = Diary(sequelize, Sequelize.DataTypes)
db.Settings = Settings(sequelize, Sequelize.DataTypes)
db.ProjectUser = ProjectUser(sequelize, Sequelize.DataTypes)
db.Subscription = Subscription(sequelize, Sequelize.DataTypes)

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
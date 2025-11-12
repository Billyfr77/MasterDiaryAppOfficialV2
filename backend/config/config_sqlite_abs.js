module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'C:/Users/billy/MasterDiaryAppOfficialV2/database.sqlite'
  },
  test: {
    dialect: 'sqlite',
    storage: './database_test.sqlite'
  },
  production: {
    dialect: 'sqlite',
    storage: './database_prod.sqlite'
  }
};


module.exports = {
  development: {
    dialect: 'sqlite',
    storage: '../database.sqlite'
  },
  test: {
    dialect: 'sqlite',
    storage: './database_test.sqlite'
  },
 production: (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME &&
    process.env.DB_HOST) ? {
                 username: process.env.DB_USER,
                 password: process.env.DB_PASSWORD,
                 database: process.env.DB_NAME,
                 host: process.env.DB_HOST,
                 dialect: 'postgres',
                 dialectOptions: {
                   socketPath: process.env.DB_SOCKET_PATH
                 },
                 logging: false
               } : {
                 dialect: 'sqlite',
                 storage: '../database.sqlite'
               }
};


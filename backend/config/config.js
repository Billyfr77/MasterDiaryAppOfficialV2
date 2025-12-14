module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || '../database.sqlite',
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: './database_test.sqlite'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // For Cloud SQL with Unix Sockets, 'host' must be the socket path
    host: process.env.DB_SOCKET_PATH || process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: process.env.DB_SOCKET_PATH ? {
      // Some PG versions/Sequelize need this explicitly in dialectOptions too
      socketPath: process.env.DB_SOCKET_PATH
    } : {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};


module.exports = {
  development: {
    dialect: 'sqlite',
    storage: '../database.sqlite'
  },
  test: {
    dialect: 'sqlite',
    storage: './database_test.sqlite'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, // For Cloud SQL, this might be a socket path or IP
    dialect: 'postgres',
    dialectOptions: {
      socketPath: process.env.DB_SOCKET_PATH // Optional: for Cloud SQL via Unix socket
    },
    logging: false
  }
};


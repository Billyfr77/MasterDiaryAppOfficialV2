module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'masterdiary_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Billyf77',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'masterdiary_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Billyf77',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'masterdiary_prod',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Billyf77',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};


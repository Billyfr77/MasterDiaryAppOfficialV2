module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'masterdiary_dev',
    username: 'postgres',
    password: 'Billyf77'
  },
  test: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'masterdiary_test',
    username: 'postgres',
    password: 'Billyf77'
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'masterdiary_prod',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Billyf77'
  }
};


const db = require('./src/models');

db.sequelize.authenticate()
  .then(() => {
    console.log('DB Connected');
    console.log('Loaded Models:', Object.keys(db));
    if (db.SafetyForm) {
      console.log('✅ SafetyForm is LOADED');
    } else {
      console.error('❌ SafetyForm is MISSING');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  });
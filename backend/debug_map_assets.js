const { MapAsset, sequelize } = require('./src/models');

async function checkAssets() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const assets = await MapAsset.findAll();
    console.log(`Found ${assets.length} MapAssets in the database.`);
    
    if (assets.length > 0) {
      console.log('--- Asset Dump ---');
      assets.forEach(a => {
        console.log(`ID: ${a.id}`);
        console.log(`Name: ${a.name}`);
        console.log(`Type: ${a.type}`);
        console.log(`Geometry: ${a.geometryType}`);
        console.log(`ProjectID: ${a.projectId}`);
        console.log(`Coordinates (Type: ${typeof a.coordinates}):`, JSON.stringify(a.coordinates).substring(0, 100) + '...');
        console.log('------------------');
      });
    } else {
      console.log('No assets found. Data is not persisting.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkAssets();

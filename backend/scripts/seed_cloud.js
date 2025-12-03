const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to Cloud Database...');
    await db.sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🔄 Synchronizing database schema...');
    await db.sequelize.sync({ force: true }); // Use { force: true } to recreate tables
    console.log('✅ Database schema synchronized.');

    // 1. Create Default Admin User
    const existingUser = await db.User.findOne({ where: { email: 'admin@masterdiary.com' } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await db.User.create({
        username: 'Admin',
        email: 'admin@masterdiary.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Created Default Admin User: admin@masterdiary.com / Admin123!');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Create Default Settings
    const defaultSettings = [
      { parameter: 'companyName', value: 'My Construction Co' },
      { parameter: 'currency', value: 'USD' },
      { parameter: 'theme', value: 'dark' }
    ];

    for (const setting of defaultSettings) {
      const exists = await db.Settings.findOne({ where: { parameter: setting.parameter } });
      if (!exists) {
        await db.Settings.create(setting);
        console.log(`✅ Created Default Setting: ${setting.parameter}`);
      }
    }

    // 3. Create a Sample Project
    const existingProject = await db.Project.findOne();
    if (!existingProject) {
      // Need a user ID first
      const user = await db.User.findOne();
      await db.Project.create({
        name: 'Example Renovation',
        client: 'John Doe',
        status: 'active',
        userId: user.id,
        site: '123 Main St',
        value: 15000
      });
      console.log('✅ Created Sample Project.');
    }

    console.log('🎉 Seeding Complete! The app should now load without crashing.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();

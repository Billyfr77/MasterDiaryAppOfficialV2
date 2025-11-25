const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to Cloud Database...');
    await db.sequelize.authenticate();
    console.log('✅ Connected.');

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
    const existingSettings = await db.Setting.findOne();
    if (!existingSettings) {
      await db.Setting.create({
        companyName: 'My Construction Co',
        currency: 'USD',
        theme: 'dark'
      });
      console.log('✅ Created Default Settings.');
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

const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

async function debugData() {
  try {
    console.log("--- Database Debug ---");
    
    // 1. Users
    const [users] = await sequelize.query("SELECT id, username, email, role FROM Users");
    console.log("Users found:", users.length);
    users.forEach(u => console.log(`- User: ${u.username} (${u.email}) ID: ${u.id}`));

    // 2. Projects
    const [projects] = await sequelize.query("SELECT id, name, userId FROM Projects");
    console.log("\nProjects found:", projects.length);
    projects.forEach(p => console.log(`- Project: ${p.name} (Owner: ${p.userId})`));

    // 3. Diaries (Logs)
    // Note: Diaries might be linked to Projects OR Users directly, let's check schema assumption
    // Based on previous `aiController.js`, it queries Diary.findAll({ where: { diaryType: 'paint' } }) 
    // but we need to check if `userId` column exists on Diary or if it's inferred via Project or Worker (Staff).
    // Let's check the table structure first.
    const [diaryTable] = await sequelize.query("PRAGMA table_info(Diaries)");
    const hasUserId = diaryTable.some(c => c.name === 'userId');
    const hasWorkerId = diaryTable.some(c => c.name === 'workerId');
    const hasProjectId = diaryTable.some(c => c.name === 'projectId');
    
    console.log("\nDiary Table Schema Check:");
    console.log(`- Has userId: ${hasUserId}`);
    console.log(`- Has workerId: ${hasWorkerId}`);
    console.log(`- Has projectId: ${hasProjectId}`);

    const [diaries] = await sequelize.query("SELECT id, date, projectId, totalCost, totalRevenue FROM Diaries");
    console.log(`\nDiaries found: ${diaries.length}`);
    diaries.forEach(d => console.log(`- Diary: ${d.date} ProjectID: ${d.projectId} Cost: ${d.totalCost}`));

  } catch (error) {
    console.error("DB Debug Error:", error);
  } finally {
    await sequelize.close();
  }
}

debugData();

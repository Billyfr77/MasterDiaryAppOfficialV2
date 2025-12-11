const db = require('./src/models');

async function testGetForms() {
  try {
    await db.sequelize.authenticate();
    console.log('DB Connected');

    const projectId = undefined;
    const type = undefined;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    console.log('Where clause:', where);

    const forms = await db.SafetyForm.findAll({
      where,
      include: [
        { model: db.User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: db.Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });
    console.log('Forms found:', forms.length);
  } catch (error) {
    console.error('Error fetching forms:', error);
  } finally {
    process.exit();
  }
}

testGetForms();

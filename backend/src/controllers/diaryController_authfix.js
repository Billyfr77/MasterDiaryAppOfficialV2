const getAllDiaries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { date, projectId } = req.query;
    const where = {};
    if (date) where.date = date;
    if (projectId) where.projectId = projectId;

    const diaries = await Diary.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'Project',
          where: { userId: req.user.id },
          required: true
        },
        { model: Staff, as: 'Staff' }
      ],
      order: [['date', 'DESC']]
    });
    res.json(diaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all notifications for user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

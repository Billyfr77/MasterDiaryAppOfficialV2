const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');
const { authenticateToken } = require('../middleware/auth');

// Send generic email
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) return res.status(400).json({ error: 'Missing fields' });

    await sendEmail(to, subject, html);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;

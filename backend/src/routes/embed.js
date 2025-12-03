const express = require('express');
const router = express.Router();
const { getMapEmbed } = require('../controllers/embedController');

router.get('/', getMapEmbed);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getHeroBanner } = require('../controllers/heroBanner.controller');

// Public route - no auth required
router.get('/hero-banner', getHeroBanner);

module.exports = router;

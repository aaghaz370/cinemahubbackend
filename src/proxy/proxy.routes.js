const express = require('express');
const router = express.Router();
const proxyController = require('./proxy.controller');

/**
 * Proxy Routes
 * Handle video stream extraction
 */

// Test endpoint
router.get('/test', proxyController.test);

// Extract stream URL from embed page
router.get('/extract', proxyController.extractStream);

module.exports = router;

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

const { getUserDbConnection } = require('../config/db');

// ================= PING ROUTE (Simple test) =================
router.get('/ping', (req, res) => {
    const userDb = getUserDbConnection();
    const readyState = userDb ? userDb.readyState : 'null';

    // readyState codes: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    console.log('🏓 Ping received! DB State:', stateMap[readyState] || readyState);

    res.json({
        success: true,
        message: 'Request routes are working!',
        dbStatus: stateMap[readyState] || 'unknown',
        dbObjectExists: !!userDb,
        timestamp: new Date().toISOString()
    });
});

// ================= TEST ROUTE =================
router.get('/test', requestController.testConnection);

// ================= USER ROUTES =================
// Create new request
router.post('/create', requestController.createRequest);

// Get user's own requests
router.get('/user/:userId', requestController.getMyRequests);

// ================= ADMIN ROUTES =================
// Get all requests (with optional status filter)
router.get('/all', requestController.getAllRequests);

// Update request status (approve/decline)
router.put('/:id/status', requestController.updateRequestStatus);

// Delete request
router.delete('/:id', requestController.deleteRequest);

module.exports = router;

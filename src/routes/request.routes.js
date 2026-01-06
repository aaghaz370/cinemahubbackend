const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

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

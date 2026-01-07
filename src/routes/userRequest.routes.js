const express = require('express');
const router = express.Router();
const userRequestController = require('../controllers/userRequest.controller');

// ==================== USER ROUTES ====================
// Create new request (login optional)
router.post('/create', userRequestController.createRequest);

// Get my pending requests (requires userId)
router.get('/user/:userId', userRequestController.getMyRequests);

// ==================== ADMIN ROUTES ====================
// Get all requests (with optional status filter)
router.get('/all', userRequestController.getAllRequests);

// Update request status (approve/decline)
router.put('/:id/status', userRequestController.updateStatus);

// Delete request
router.delete('/:id', userRequestController.deleteRequest);

module.exports = router;

/**
 * User Routes for CinemaHub
 * Public routes for user features
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// ================= AUTH =================
// Login/Register with Firebase
router.post('/user/auth/login', userController.loginWithFirebase);

// Get user profile
router.get('/user/:firebaseUid/profile', userController.getProfile);

// Update user profile (name, avatar)
router.put('/user/:firebaseUid/profile', userController.updateProfile);

// ================= WATCHLIST =================
router.get('/user/:firebaseUid/watchlist', userController.getWatchlist);
router.post('/user/:firebaseUid/watchlist', userController.addToWatchlist);
router.delete('/user/:firebaseUid/watchlist/:contentId', userController.removeFromWatchlist);

// ================= CONTINUE WATCHING =================
router.post('/user/:firebaseUid/continue-watching', userController.updateContinueWatching);
router.delete('/user/:firebaseUid/continue-watching/:contentId', userController.removeContinueWatching);

// ================= WATCH HISTORY =================
router.post('/user/:firebaseUid/history', userController.addToHistory);
router.delete('/user/:firebaseUid/history', userController.clearHistory);

// ================= SYNC =================
router.post('/user/:firebaseUid/sync', userController.syncData);

// ================= REQUESTS =================
router.post('/user/:firebaseUid/requests', userController.submitRequest);
router.get('/user/:firebaseUid/requests', userController.getUserRequests);

// ================= RESET (Debug) =================
router.delete('/user/:firebaseUid/reset', userController.resetUserData);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, isSuperAdmin } = require('../middleware/auth.middleware');

// Public routes
router.post('/admin/auth/login', authController.login);
router.post('/admin/auth/forgot-password', authController.forgotPassword);
router.post('/admin/auth/reset-password', authController.resetPassword);

// Protected routes
router.get('/admin/auth/me', authenticate, authController.me);
router.post('/admin/auth/change-password', authenticate, authController.changePassword);

// Super Admin only routes
router.post('/admin/users', authenticate, isSuperAdmin, authController.createUser);
router.get('/admin/users', authenticate, isSuperAdmin, authController.getAllUsers);
router.put('/admin/users/:id', authenticate, isSuperAdmin, authController.updateUser);
router.delete('/admin/users/:id', authenticate, isSuperAdmin, authController.deleteUser);

module.exports = router;

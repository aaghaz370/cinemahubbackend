const jwt = require('jsonwebtoken');
const AdminUser = require('../models/admin.user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Verify JWT token and attach user to request
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await AdminUser.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Check specific permission
exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.user.permissions[permission]) {
            return res.status(403).json({
                error: 'Permission denied',
                message: `You don't have '${permission}' permission`
            });
        }

        next();
    };
};

// Check if user is Super Admin
exports.isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Only Super Admin can perform this action' });
    }
    next();
};

// Check if user is Super Admin or Admin
exports.isAdminOrAbove = (req, res, next) => {
    if (!req.user || !['superadmin', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = exports;

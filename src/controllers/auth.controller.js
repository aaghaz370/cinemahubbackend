const jwt = require('jsonwebtoken');
const AdminUser = require('../models/admin.user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await AdminUser.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current user
exports.me = async (req, res) => {
    try {
        const user = await AdminUser.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Create new user (Super Admin only)
exports.createUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validation
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if email exists
        const existing = await AdminUser.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Prevent creating multiple super admins
        if (role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ error: 'Cannot create Super Admin' });
        }

        // Create user
        const user = new AdminUser({
            email: email.toLowerCase(),
            password,
            name,
            role,
            createdBy: req.user._id
        });

        await user.save();

        res.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Get all users (Super Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await AdminUser.find()
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user (Super Admin only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, isActive, permissions } = req.body;

        const user = await AdminUser.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent modifying super admin
        if (user.role === 'superadmin' && req.user._id.toString() !== id) {
            return res.status(403).json({ error: 'Cannot modify Super Admin' });
        }

        // Update fields
        if (name) user.name = name;
        if (role && role !== 'superadmin') user.role = role; // Prevent role change to superadmin
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (permissions) user.permissions = { ...user.permissions, ...permissions };

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user (Super Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await AdminUser.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting super admin
        if (user.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot delete Super Admin' });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(403).json({ error: 'Cannot delete yourself' });
        }

        await AdminUser.findByIdAndDelete(id);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        const user = await AdminUser.findById(req.user._id);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

module.exports = exports;

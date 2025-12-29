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

// Forgot password - Request reset email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await AdminUser.findOne({ email: email.toLowerCase() });

        // Always return success (security - don't reveal if email exists)
        if (!user) {
            return res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent.'
            });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = Date.now() + 3600000; // 1 hour

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetExpiry;
        await user.save();

        // Send email
        const { sendPasswordResetEmail, isEmailConfigured } = require('../services/email.service');

        if (isEmailConfigured()) {
            await sendPasswordResetEmail(user.email, resetToken, user.name);
        } else {
            console.log('⚠️ Email not configured. Reset token:', resetToken);
        }

        res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent.',
            // Only include token in dev mode for testing
            ...(process.env.NODE_ENV !== 'production' && { devToken: resetToken })
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Find user with valid token
        const user = await AdminUser.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update password and clear token
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

module.exports = exports;


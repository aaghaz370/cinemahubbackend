const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'editor', 'viewer'],
        default: 'viewer'
    },
    permissions: {
        // Movies
        movies_view: { type: Boolean, default: true },
        movies_create: { type: Boolean, default: false },
        movies_edit: { type: Boolean, default: false },
        movies_delete: { type: Boolean, default: false },

        // Series
        series_view: { type: Boolean, default: true },
        series_create: { type: Boolean, default: false },
        series_edit: { type: Boolean, default: false },
        series_delete: { type: Boolean, default: false },

        // Abyss
        abyss_view: { type: Boolean, default: true },
        abyss_upload: { type: Boolean, default: false },
        abyss_delete: { type: Boolean, default: false },

        // VOE
        voe_view: { type: Boolean, default: true },
        voe_upload: { type: Boolean, default: false },
        voe_delete: { type: Boolean, default: false },

        // Streamtape
        streamtape_view: { type: Boolean, default: true },
        streamtape_upload: { type: Boolean, default: false },
        streamtape_delete: { type: Boolean, default: false },

        // User Management (Only Super Admin)
        users_manage: { type: Boolean, default: false }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    // Password reset fields
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
adminUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
adminUserSchema.pre('save', function (next) {
    if (!this.isModified('role')) return next();

    switch (this.role) {
        case 'superadmin':
            // Full access to everything
            this.permissions = {
                movies_view: true, movies_create: true, movies_edit: true, movies_delete: true,
                series_view: true, series_create: true, series_edit: true, series_delete: true,
                abyss_view: true, abyss_upload: true, abyss_delete: true,
                voe_view: true, voe_upload: true, voe_delete: true,
                streamtape_view: true, streamtape_upload: true, streamtape_delete: true,
                users_manage: true
            };
            break;

        case 'admin':
            // Can do everything except manage users and limited delete
            this.permissions = {
                movies_view: true, movies_create: true, movies_edit: true, movies_delete: true,
                series_view: true, series_create: true, series_edit: true, series_delete: true,
                abyss_view: true, abyss_upload: true, abyss_delete: true,
                voe_view: true, voe_upload: true, voe_delete: true,
                streamtape_view: true, streamtape_upload: true, streamtape_delete: true,
                users_manage: false
            };
            break;

        case 'editor':
            // Can create and edit, no delete
            this.permissions = {
                movies_view: true, movies_create: true, movies_edit: true, movies_delete: false,
                series_view: true, series_create: true, series_edit: true, series_delete: false,
                abyss_view: true, abyss_upload: true, abyss_delete: false,
                voe_view: true, voe_upload: true, voe_delete: false,
                streamtape_view: true, streamtape_upload: true, streamtape_delete: false,
                users_manage: false
            };
            break;

        case 'viewer':
            // Read-only access
            this.permissions = {
                movies_view: true, movies_create: false, movies_edit: false, movies_delete: false,
                series_view: true, series_create: false, series_edit: false, series_delete: false,
                abyss_view: true, abyss_upload: false, abyss_delete: false,
                voe_view: true, voe_upload: false, voe_delete: false,
                streamtape_view: true, streamtape_upload: false, streamtape_delete: false,
                users_manage: false
            };
            break;
    }
    next();
});

module.exports = mongoose.model('AdminUser', adminUserSchema);

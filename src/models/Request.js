const mongoose = require('mongoose');
const { getUserDbConnection } = require('../config/db');

const requestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: String,

    // Request Details
    contentType: {
        type: String,
        enum: ['movie', 'series'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    year: Number,
    language: String,
    genre: [String],
    description: {
        type: String,
        maxlength: 500
    },
    imdbLink: String,
    tmdbId: Number,

    // Request Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending',
        index: true
    },

    // Admin Response
    adminNote: String,
    reviewedBy: String,
    reviewedAt: Date,

    // Priority (optional for admin)
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }

}, { timestamps: true });

// Indexes for faster queries
requestSchema.index({ userId: 1, createdAt: -1 });
requestSchema.index({ status: 1, createdAt: -1 });

// Simple model creation - try User DB first, fallback to default
const userDb = getUserDbConnection();
let RequestModel;

if (userDb && userDb.readyState === 1) {
    // User DB connected - use it
    try {
        RequestModel = userDb.models.Request || userDb.model('Request', requestSchema);
        console.log('✅ Request model using User Database');
    } catch (e) {
        console.warn('⚠️ Request model fallback to default DB');
        RequestModel = mongoose.models.Request || mongoose.model('Request', requestSchema);
    }
} else {
    // Fallback to default database
    console.log('⚠️ Request model using Default Database (User DB not ready)');
    RequestModel = mongoose.models.Request || mongoose.model('Request', requestSchema);
}

module.exports = RequestModel;

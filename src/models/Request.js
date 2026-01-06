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

// Get the user database connection (which is now initialized on module load)
const userDb = getUserDbConnection();

let RequestModel;

if (userDb) {
    // Use User Database (Second MongoDB)
    try {
        RequestModel = userDb.model('Request', requestSchema);
        console.log('✅ Request Model attached to User Database');
    } catch (e) {
        // If model already compiled
        RequestModel = userDb.models.Request;
    }
} else {
    // Fallback to Default Database (if User DB not configured)
    console.log('⚠️ Request Model fallback to Default Database');
    RequestModel = mongoose.model('Request', requestSchema);
}

module.exports = RequestModel;

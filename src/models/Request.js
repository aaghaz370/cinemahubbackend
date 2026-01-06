const mongoose = require('mongoose');

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

// Lazy loading function to get the model with User DB connection
let RequestModel = null;

function getRequestModel() {
    if (RequestModel) return RequestModel;

    const { getUserDbConnection } = require('../config/db');
    const userDb = getUserDbConnection();

    if (userDb) {
        console.log('✅ Using User Database for Requests');
        RequestModel = userDb.model('Request', requestSchema);
    } else {
        console.log('⚠️ Using Default Database for Requests (User DB not available)');
        RequestModel = mongoose.model('Request', requestSchema);
    }

    return RequestModel;
}

module.exports = getRequestModel();

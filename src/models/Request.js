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

// Export model using User Database connection (second MongoDB)
const userDb = getUserDbConnection();

// If userDb connection exists, use it; otherwise fall back to default
const Request = userDb
    ? userDb.model('Request', requestSchema)
    : mongoose.model('Request', requestSchema);

module.exports = Request;

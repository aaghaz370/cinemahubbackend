const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema({
    // User Info (if logged in)
    userId: String,
    userName: String,
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
    genre: String,
    description: {
        type: String,
        maxlength: 500
    },
    imdbLink: String,

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },

    // Telegram Message ID (to track message in bot)
    telegramMessageId: Number,

    // Admin Response
    adminNote: String,
    reviewedAt: Date

}, { timestamps: true });

// Index for faster queries
userRequestSchema.index({ userId: 1, status: 1 });
userRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('UserRequest', userRequestSchema);

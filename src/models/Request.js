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

// ROBUST MODEL CREATION
// This function gets called on every request to ensure we use the best available connection
const getModel = () => {
    const userDb = getUserDbConnection();

    if (userDb && userDb.readyState === 1) {
        // User DB is connected and ready
        try {
            if (userDb.models.Request) return userDb.models.Request;
            return userDb.model('Request', requestSchema);
        } catch (e) {
            console.warn('⚠️ Error attaching Request to UserDB, falling back:', e.message);
        }
    }

    // Fallback to default connection if UserDB is not ready
    if (mongoose.models.Request) return mongoose.models.Request;
    return mongoose.model('Request', requestSchema);
};

// Export a wrapped "Proxy" object that forwards calls to the correct model
// This ensures that even if DB connects LATER, we switch to it dynamically
const RequestProxy = {
    find: (...args) => getModel().find(...args),
    findOne: (...args) => getModel().findOne(...args),
    findById: (...args) => getModel().findById(...args),
    findByIdAndUpdate: (...args) => getModel().findByIdAndUpdate(...args),
    findByIdAndDelete: (...args) => getModel().findByIdAndDelete(...args),
    countDocuments: (...args) => getModel().countDocuments(...args),
    aggregate: (...args) => getModel().aggregate(...args),

    // For 'new Request()' we need a manual approach in the controller
    // OR we expose the schema and model getter
    get model() { return getModel(); },
    schema: requestSchema
};

module.exports = RequestProxy;

/**
 * User Model for CinemaHub
 * Stored in separate USER MongoDB cluster
 * Contains: Profile, Watchlist, History, Requests
 */

const mongoose = require('mongoose');
const { getUserDbConnection } = require('../config/db');

const userSchema = new mongoose.Schema({
    // Firebase UID (from Google Auth)
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Profile Info
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    displayName: {
        type: String,
        default: 'User'
    },
    photoURL: {
        type: String,
        default: null
    },

    // Watchlist (My List)
    watchlist: [{
        contentId: { type: String, required: true },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        addedAt: { type: Date, default: Date.now }
    }],

    // Continue Watching
    continueWatching: [{
        contentId: { type: String, required: true },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        progress: { type: Number, default: 0 }, // Percentage or seconds
        episodeInfo: {
            seasonNumber: Number,
            episodeNumber: Number,
            episodeTitle: String
        },
        lastWatched: { type: Date, default: Date.now }
    }],

    // Watch History
    watchHistory: [{
        contentId: { type: String, required: true },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        watchedAt: { type: Date, default: Date.now },
        episodeInfo: {
            seasonNumber: Number,
            episodeNumber: Number
        }
    }],

    // User Preferences
    preferences: {
        favoriteGenres: [String],
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Limit arrays to prevent bloat
userSchema.pre('save', function (next) {
    // Keep only last 100 history items
    if (this.watchHistory.length > 100) {
        this.watchHistory = this.watchHistory.slice(-100);
    }
    // Keep only last 50 continue watching
    if (this.continueWatching.length > 50) {
        this.continueWatching = this.continueWatching.slice(-50);
    }
    next();
});

// Create model using User DB connection
let UserModel = null;

const getUser = () => {
    if (UserModel) return UserModel;

    const userDb = getUserDbConnection();
    if (userDb) {
        UserModel = userDb.model('User', userSchema);
        return UserModel;
    }

    // Fallback to default connection if no separate user DB
    return mongoose.model('User', userSchema);
};

module.exports = { getUser, userSchema };

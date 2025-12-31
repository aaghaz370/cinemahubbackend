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
        required: true,
        unique: true,
        minlength: 1,
        maxlength: 30,
        trim: true
    },
    photoURL: {
        type: String,
        default: null
    },
    // Store original Google photo URL for restoration
    originalGooglePhoto: {
        type: String,
        default: null
    },
    // Custom avatar selection (avatar URL or null)
    customAvatar: {
        type: String,
        default: null
    },

    // Watchlist (My List)
    watchlist: [{
        contentId: { type: String, required: true },
        slug: { type: String },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        metadata: { type: mongoose.Schema.Types.Mixed }, // Full metadata for display
        addedAt: { type: Date, default: Date.now }
    }],

    // Continue Watching
    continueWatching: [{
        contentId: { type: String, required: true },
        slug: { type: String },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        metadata: { type: mongoose.Schema.Types.Mixed },
        progress: { type: Number, default: 0 },
        season: Number,
        episode: Number,
        episodeInfo: {
            seasonNumber: Number,
            episodeNumber: Number,
            episodeTitle: String
        },
        timestamp: Date,
        lastWatched: { type: Date, default: Date.now }
    }],

    // Watch History
    watchHistory: [{
        contentId: { type: String, required: true },
        slug: { type: String },
        contentType: { type: String, enum: ['movie', 'series'], required: true },
        title: String,
        poster: String,
        metadata: { type: mongoose.Schema.Types.Mixed },
        timestamp: Date,
        watchedAt: { type: Date, default: Date.now },
        episodeInfo: {
            seasonNumber: Number,
            episodeNumber: Number
        }
    }],

    // ================= WATCH STATISTICS & ACHIEVEMENTS =================
    watchStats: {
        // Total watch time (in minutes)
        totalWatchTime: { type: Number, default: 0 },

        // Movie/Series counts
        moviesWatched: { type: Number, default: 0 },
        seriesWatched: { type: Number, default: 0 },
        episodesWatched: { type: Number, default: 0 },

        // Marathon tracking (continuous watching)
        currentMarathonMinutes: { type: Number, default: 0 },
        longestMarathonMinutes: { type: Number, default: 0 },
        lastWatchEndTime: { type: Date, default: null }, // To detect 10min gap

        // Time-based stats (for leaderboards)
        todayMinutes: { type: Number, default: 0 },
        weekMinutes: { type: Number, default: 0 },
        monthMinutes: { type: Number, default: 0 },
        yearMinutes: { type: Number, default: 0 },

        // Reset tracking
        lastResetDate: { type: Date, default: Date.now },
        statsYear: { type: Number, default: new Date().getFullYear() },

        // Last watch session
        lastWatchDate: { type: Date, default: null }
    },

    // User Preferences
    preferences: {
        favoriteGenres: [String],
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Pre-save hook for cleanup and auto-reset
userSchema.pre('save', function (next) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // ===== YEARLY RESET =====
    // If year changed, reset yearly stats
    if (this.watchStats && this.watchStats.statsYear !== currentYear) {
        this.watchStats.yearMinutes = 0;
        this.watchStats.statsYear = currentYear;
        this.watchStats.lastResetDate = now;
        console.log(`📅 Yearly stats reset for user: ${this.email}`);
    }

    // ===== TIME-BASED RESETS =====
    if (this.watchStats && this.watchStats.lastResetDate) {
        const daysSinceReset = Math.floor((now - new Date(this.watchStats.lastResetDate)) / (1000 * 60 * 60 * 24));

        // Reset daily stats (if new day)
        if (daysSinceReset >= 1) {
            this.watchStats.todayMinutes = 0;
        }

        // Reset weekly stats (if 7+ days)
        if (daysSinceReset >= 7) {
            this.watchStats.weekMinutes = 0;
        }
        // Reset monthly stats (if 30+ days)
        if (daysSinceReset >= 30) {
            this.watchStats.monthMinutes = 0;
        }
    }

    // ===== OLD DATA CLEANUP =====
    // Remove watch history older than 1 year
    if (this.watchHistory && this.watchHistory.length > 0) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const originalLength = this.watchHistory.length;
        this.watchHistory = this.watchHistory.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate > oneYearAgo;
        });

        if (this.watchHistory.length < originalLength) {
            console.log(`🗑️ Cleaned ${originalLength - this.watchHistory.length} old history items for ${this.email}`);
        }
    }

    // Keep only last 100 history items (prevent bloat)
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

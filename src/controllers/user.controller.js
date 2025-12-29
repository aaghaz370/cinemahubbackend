/**
 * User Controller for CinemaHub
 * Handles user profiles, watchlist, history, sync
 */

const { getUser } = require('../models/user.model');
const { getRequest } = require('../models/request.model');

// ================= AUTH & PROFILE =================

// Login/Register with Firebase token
exports.loginWithFirebase = async (req, res) => {
    try {
        const { firebaseUid, email, displayName, photoURL } = req.body;

        if (!firebaseUid || !email) {
            return res.status(400).json({ error: 'Firebase UID and email required' });
        }

        const User = getUser();

        // Find or create user
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            // Create new user
            user = new User({
                firebaseUid,
                email,
                displayName: displayName || email.split('@')[0],
                photoURL
            });
            await user.save();
            console.log('✅ New user created:', email);
        } else {
            // Update profile if changed
            if (displayName) user.displayName = displayName;
            if (photoURL) user.photoURL = photoURL;
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                watchlistCount: user.watchlist.length,
                historyCount: user.watchHistory.length
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const User = getUser();

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                watchlist: user.watchlist,
                continueWatching: user.continueWatching,
                watchHistory: user.watchHistory.slice(-50), // Last 50
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// ================= WATCHLIST =================

// Get watchlist
exports.getWatchlist = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const User = getUser();

        const user = await User.findOne({ firebaseUid });

        res.json({
            success: true,
            watchlist: user?.watchlist || []
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
};

// Add to watchlist
exports.addToWatchlist = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { contentId, contentType, title, poster } = req.body;

        if (!contentId || !contentType) {
            return res.status(400).json({ error: 'Content ID and type required' });
        }

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already in watchlist
        const exists = user.watchlist.some(item => item.contentId === contentId);
        if (exists) {
            return res.json({ success: true, message: 'Already in watchlist' });
        }

        // Add to watchlist
        user.watchlist.push({
            contentId,
            contentType,
            title,
            poster,
            addedAt: new Date()
        });

        await user.save();

        res.json({ success: true, message: 'Added to watchlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
};

// Remove from watchlist
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { firebaseUid, contentId } = req.params;
        const User = getUser();

        await User.updateOne(
            { firebaseUid },
            { $pull: { watchlist: { contentId } } }
        );

        res.json({ success: true, message: 'Removed from watchlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
};

// ================= CONTINUE WATCHING =================

// Update continue watching
exports.updateContinueWatching = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { contentId, contentType, title, poster, progress, episodeInfo } = req.body;

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find existing entry
        const existingIndex = user.continueWatching.findIndex(
            item => item.contentId === contentId
        );

        if (existingIndex >= 0) {
            // Update existing
            user.continueWatching[existingIndex] = {
                ...user.continueWatching[existingIndex],
                progress,
                episodeInfo,
                lastWatched: new Date()
            };
        } else {
            // Add new
            user.continueWatching.push({
                contentId,
                contentType,
                title,
                poster,
                progress,
                episodeInfo,
                lastWatched: new Date()
            });
        }

        await user.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update continue watching' });
    }
};

// Remove from continue watching
exports.removeContinueWatching = async (req, res) => {
    try {
        const { firebaseUid, contentId } = req.params;
        const User = getUser();

        await User.updateOne(
            { firebaseUid },
            { $pull: { continueWatching: { contentId } } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove' });
    }
};

// ================= WATCH HISTORY =================

// Add to history
exports.addToHistory = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { contentId, contentType, title, poster, episodeInfo } = req.body;

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add to history
        user.watchHistory.push({
            contentId,
            contentType,
            title,
            poster,
            watchedAt: new Date(),
            episodeInfo
        });

        await user.save();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to history' });
    }
};

// Clear history
exports.clearHistory = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const User = getUser();

        await User.updateOne(
            { firebaseUid },
            { $set: { watchHistory: [] } }
        );

        res.json({ success: true, message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear history' });
    }
};

// ================= SYNC (LocalStorage to Cloud) =================

// Sync all data from localStorage to cloud
exports.syncData = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { watchlist, continueWatching, watchHistory } = req.body;

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Merge watchlist (avoid duplicates)
        if (watchlist && Array.isArray(watchlist)) {
            const existingIds = user.watchlist.map(w => w.contentId);
            const newItems = watchlist.filter(w => !existingIds.includes(w.contentId));
            user.watchlist.push(...newItems);
        }

        // Replace continue watching with latest
        if (continueWatching && Array.isArray(continueWatching)) {
            user.continueWatching = continueWatching;
        }

        // Merge history
        if (watchHistory && Array.isArray(watchHistory)) {
            user.watchHistory.push(...watchHistory);
        }

        await user.save();

        res.json({
            success: true,
            message: 'Data synced successfully',
            counts: {
                watchlist: user.watchlist.length,
                continueWatching: user.continueWatching.length,
                watchHistory: user.watchHistory.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
};

// ================= REQUESTS =================

// Submit movie/series request
exports.submitRequest = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { title, type, year, imdbLink, description, userEmail, userName } = req.body;

        if (!title || !type) {
            return res.status(400).json({ error: 'Title and type required' });
        }

        const Request = getRequest();

        const request = new Request({
            userId: firebaseUid,
            userEmail,
            userName,
            title,
            type,
            year,
            imdbLink,
            description
        });

        await request.save();

        res.json({ success: true, message: 'Request submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit request' });
    }
};

// Get user's requests
exports.getUserRequests = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const Request = getRequest();

        const requests = await Request.find({ userId: firebaseUid })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

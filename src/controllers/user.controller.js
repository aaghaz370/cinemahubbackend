/**
 * User Controller for CinemaHub
 * Handles user profiles, watchlist, history, sync
 */

const { getUser } = require('../models/user.model');
const { getRequest } = require('../models/request.model');

// ================= AUTH & PROFILE =================

// Helper function to generate unique username
const generateUniqueUsername = async (baseUsername, User) => {
    let username = baseUsername;
    let attempt = 0;
    const maxAttempts = 50;

    // Emoji/special suffixes for unique names
    const suffixes = ['✨', '🎬', '🎭', '⭐', '🌟', '💫', '🎪', '🎯', '🔥', '💯', '_', '-', '.'];

    while (attempt < maxAttempts) {
        // Check if username is available
        const existing = await User.findOne({ displayName: username });

        if (!existing) {
            return username; // Found unique username!
        }

        // Try with suffix
        attempt++;
        if (attempt <= suffixes.length) {
            username = baseUsername + suffixes[attempt - 1];
        } else {
            // Use random numbers
            const randomNum = Math.floor(Math.random() * 9999);
            username = baseUsername + randomNum;
        }
    }

    // Fallback: timestamp-based unique name
    return baseUsername + Date.now();
};

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
        let isNewUser = false;

        if (!user) {
            // Create new user - generate unique username
            let baseUsername = displayName || email.split('@')[0];
            baseUsername = baseUsername.substring(0, 25); // Leave room for suffixes

            const uniqueUsername = await generateUniqueUsername(baseUsername, User);

            user = new User({
                firebaseUid,
                email,
                displayName: uniqueUsername,
                photoURL: photoURL,
                originalGooglePhoto: photoURL // Save original Google photo
            });
            isNewUser = true;
            await user.save();
            console.log(`✅ New user created: ${email} with username: ${uniqueUsername}`);
        } else {
            // Existing user - DON'T overwrite custom name/avatar
            // Only update originalGooglePhoto if not set
            if (!user.originalGooglePhoto && photoURL) {
                user.originalGooglePhoto = photoURL;
                await user.save();
            }
            // Don't touch displayName or photoURL if user has customized them
        }

        res.json({
            success: true,
            isNewUser,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                customAvatar: user.customAvatar,
                originalGooglePhoto: user.originalGooglePhoto,
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
                customAvatar: user.customAvatar,
                originalGooglePhoto: user.originalGooglePhoto,
                watchlist: user.watchlist,
                continueWatching: user.continueWatching,
                watchHistory: user.watchHistory.slice(-100),
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Update user profile (name, avatar)
exports.updateProfile = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { displayName, photoURL, useGooglePhoto } = req.body;

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update display name if provided
        if (displayName && displayName.trim()) {
            const newName = displayName.trim();

            // Validate length
            if (newName.length < 1 || newName.length > 30) {
                return res.status(400).json({ error: 'Username must be 1-30 characters' });
            }

            // Check if username is taken by another user
            if (newName !== user.displayName) {
                const existingUser = await User.findOne({ displayName: newName });
                if (existingUser && existingUser.firebaseUid !== firebaseUid) {
                    return res.status(409).json({ error: 'Username already taken', available: false });
                }
            }

            user.displayName = newName;
        }

        // Update photo
        if (useGooglePhoto) {
            // Reset to Google photo (stored in originalGooglePhoto or null)
            user.photoURL = user.originalGooglePhoto || null;
            user.customAvatar = null;
        } else if (photoURL) {
            // Store original Google photo if not already saved
            if (!user.originalGooglePhoto && user.photoURL) {
                user.originalGooglePhoto = user.photoURL;
            }
            user.photoURL = photoURL;
            user.customAvatar = photoURL;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated',
            user: {
                displayName: user.displayName,
                photoURL: user.photoURL,
                customAvatar: user.customAvatar
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
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

// ================= RESET DATA =================

// Reset all user data (for debugging/fresh start)
exports.resetUserData = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const User = getUser();

        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Reset all data but keep profile info
        user.watchlist = [];
        user.continueWatching = [];
        user.watchHistory = [];
        // Optionally reset avatar to Google photo
        // user.photoURL = user.originalGooglePhoto;
        // user.customAvatar = null;

        await user.save();

        console.log('🔄 User data reset:', user.email);

        res.json({
            success: true,
            message: 'User data reset successfully'
        });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: 'Failed to reset data' });
    }
};

// ================= USERNAME AVAILABILITY CHECK =================

exports.checkUsernameAvailability = async (req, res) => {
    try {
        const { username, currentFirebaseUid } = req.query;

        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }

        const trimmedUsername = username.trim();

        // Validate length
        if (trimmedUsername.length < 1 || trimmedUsername.length > 30) {
            return res.json({
                available: false,
                error: 'Username must be 1-30 characters'
            });
        }

        const User = getUser();
        const existing = await User.findOne({ displayName: trimmedUsername });

        // If found and it's not the current user, it's taken
        if (existing && existing.firebaseUid !== currentFirebaseUid) {
            // Generate suggestions
            const suggestions = [];
            const suffixes = ['✨', '🎬', '⭐', '💫', '🔥'];

            for (let i = 0; i < 3; i++) {
                const suffix = suffixes[i] || Math.floor(Math.random() * 999);
                suggestions.push(trimmedUsername + suffix);
            }

            return res.json({
                available: false,
                suggestions
            });
        }

        // Available!
        res.json({
            available: true
        });

    } catch (error) {
        console.error('Username check error:', error);
        res.status(500).json({ error: 'Failed to check username' });
    }
};

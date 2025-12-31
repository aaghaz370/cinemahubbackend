/**
 * Watch Session Tracking Controller
 * Handles real-time watch time tracking and statistics
 */

const { getUser } = require('../models/user.model');

// ================= TRACK WATCH SESSION =================

exports.trackWatchSession = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { contentId, contentType, watchDuration, isComplete } = req.body;

        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize watchStats if not exists
        if (!user.watchStats) {
            user.watchStats = {
                totalWatchTime: 0,
                moviesWatched: 0,
                seriesWatched: 0,
                episodesWatched: 0,
                currentMarathonMinutes: 0,
                longestMarathonMinutes: 0,
                todayMinutes: 0,
                weekMinutes: 0,
                monthMinutes: 0,
                yearMinutes: 0,
                lastResetDate: new Date(),
                statsYear: new Date().getFullYear()
            };
        }

        const now = new Date();
        const durationMinutes = Math.floor(watchDuration / 60); // Convert seconds to minutes

        // ===== MARATHON DETECTION =====
        const tenMinutesGap = 10 * 60 * 1000; // 10 minutes in milliseconds
        const lastWatchTime = user.watchStats.lastWatchEndTime;

        let isMarathonContinues = false;
        if (lastWatchTime) {
            const timeSinceLastWatch = now - new Date(lastWatchTime);
            isMarathonContinues = timeSinceLastWatch < tenMinutesGap;
        }

        if (isMarathonContinues) {
            // Continue marathon
            user.watchStats.currentMarathonMinutes += durationMinutes;
        } else {
            // New marathon session
            // Save previous marathon if it was longer
            if (user.watchStats.currentMarathonMinutes > user.watchStats.longestMarathonMinutes) {
                user.watchStats.longestMarathonMinutes = user.watchStats.currentMarathonMinutes;
            }
            user.watchStats.currentMarathonMinutes = durationMinutes;
        }

        user.watchStats.lastWatchEndTime = now;

        // ===== UPDATE WATCH STATS ====
        user.watchStats.totalWatchTime += durationMinutes;
        user.watchStats.todayMinutes += durationMinutes;
        user.watchStats.weekMinutes += durationMinutes;
        user.watchStats.monthMinutes += durationMinutes;
        user.watchStats.yearMinutes += durationMinutes;
        user.watchStats.lastWatchDate = now;

        // ===== COUNT COMPLETIONS =====
        // Only count if video was watched to completion (or near completion - 90%+)
        if (isComplete) {
            if (contentType === 'movie') {
                user.watchStats.moviesWatched += 1;
            } else if (contentType === 'series') {
                user.watchStats.episodesWatched += 1;
                // Count series when first episode watched (or track separately)
                user.watchStats.seriesWatched += 1;
            }
        }

        await user.save();

        console.log(`⏱️ Watch tracked: ${user.email} - ${durationMinutes}min (Marathon: ${user.watchStats.currentMarathonMinutes}min)`);

        res.json({
            success: true,
            stats: {
                totalWatchTime: user.watchStats.totalWatchTime,
                todayMinutes: user.watchStats.todayMinutes,
                currentMarathon: user.watchStats.currentMarathonMinutes,
                longestMarathon: user.watchStats.longestMarathonMinutes
            }
        });

    } catch (error) {
        console.error('Track watch session error:', error);
        res.status(500).json({ error: 'Failed to track watch session' });
    }
};

// ================= GET USER WATCH STATS =================

exports.getWatchStats = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const User = getUser();
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            stats: user.watchStats || {
                totalWatchTime: 0,
                moviesWatched: 0,
                seriesWatched: 0,
                episodesWatched: 0,
                todayMinutes: 0,
                weekMinutes: 0,
                monthMinutes: 0,
                yearMinutes: 0,
                currentMarathonMinutes: 0,
                longestMarathonMinutes: 0
            }
        });

    } catch (error) {
        console.error('Get watch stats error:', error);
        res.status(500).json({ error: 'Failed to get watch stats' });
    }
};

// ================= GET LEADERBOARD =================

exports.getLeaderboard = async (req, res) => {
    try {
        const { period = 'week', limit = 10 } = req.query;
        const User = getUser();

        // Determine which field to sort by
        const sortField = period === 'today' ? 'watchStats.todayMinutes' :
            period === 'week' ? 'watchStats.weekMinutes' :
                period === 'month' ? 'watchStats.monthMinutes' :
                    period === 'year' ? 'watchStats.yearMinutes' :
                        'watchStats.totalWatchTime';

        const topUsers = await User.find({})
            .select('displayName photoURL watchStats')
            .sort({ [sortField]: -1 })
            .limit(parseInt(limit));

        const leaderboard = topUsers.map((user, index) => ({
            rank: index + 1,
            name: user.displayName,
            avatar: user.photoURL,
            watchTime: user.watchStats?.[period === 'today' ? 'todayMinutes' :
                period === 'week' ? 'weekMinutes' :
                    period === 'month' ? 'monthMinutes' :
                        period === 'year' ? 'yearMinutes' :
                            'totalWatchTime'] || 0,
            moviesWatched: user.watchStats?.moviesWatched || 0
        }));

        res.json({
            success: true,
            period,
            leaderboard
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
};

// ================= GET USER RANK =================

exports.getUserRank = async (req, res) => {
    try {
        const { firebaseUid } = req.params;
        const { period = 'week' } = req.query;
        const User = getUser();

        const user = await User.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sortField = period === 'today' ? 'watchStats.todayMinutes' :
            period === 'week' ? 'watchStats.weekMinutes' :
                period === 'month' ? 'watchStats.monthMinutes' :
                    period === 'year' ? 'watchStats.yearMinutes' :
                        'watchStats.totalWatchTime';

        const userWatchTime = user.watchStats?.[period === 'today' ? 'todayMinutes' :
            period === 'week' ? 'weekMinutes' :
                period === 'month' ? 'monthMinutes' :
                    period === 'year' ? 'yearMinutes' :
                        'totalWatchTime'] || 0;

        // Count how many users have more watch time
        const usersAbove = await User.countDocuments({
            [sortField]: { $gt: userWatchTime }
        });

        const rank = usersAbove + 1;

        res.json({
            success: true,
            rank,
            watchTime: userWatchTime,
            period
        });

    } catch (error) {
        console.error('Get user rank error:', error);
        res.status(500).json({ error: 'Failed to get user rank' });
    }
};

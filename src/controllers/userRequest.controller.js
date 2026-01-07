const UserRequest = require('../models/UserRequest');
const { sendRequestNotification, updateRequestStatus } = require('../services/telegram.service');

// ==================== USER - CREATE REQUEST ====================
exports.createRequest = async (req, res) => {
    try {
        const {
            userId,
            userName,
            userEmail,
            contentType,
            title,
            year,
            language,
            genre,
            description,
            imdbLink
        } = req.body;

        // Validation
        if (!contentType || !title) {
            return res.status(400).json({
                success: false,
                message: 'Content type and title are required'
            });
        }

        // Check for duplicate pending request (same title, regardless of user)
        const existingRequest = await UserRequest.findOne({
            title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A pending request for this title already exists'
            });
        }

        // Create request
        const newRequest = new UserRequest({
            userId,
            userName: userName || 'Anonymous',
            userEmail,
            contentType,
            title: title.trim(),
            year,
            language,
            genre,
            description,
            imdbLink
        });

        await newRequest.save();

        // Send Telegram notification
        const telegramMessageId = await sendRequestNotification(newRequest);
        if (telegramMessageId) {
            newRequest.telegramMessageId = telegramMessageId;
            await newRequest.save();
        }

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully!',
            data: newRequest
        });

    } catch (error) {
        console.error('❌ Create request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message
        });
    }
};

// ==================== USER - GET MY PENDING REQUESTS ====================
exports.getMyRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required'
            });
        }

        // Only return pending requests
        const requests = await UserRequest.find({
            userId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (error) {
        console.error('❌ Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
            error: error.message
        });
    }
};

// ==================== ADMIN - GET ALL REQUESTS ====================
exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;

        const query = status ? { status } : {};

        const requests = await UserRequest.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        // Stats
        const stats = await UserRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            count: requests.length,
            stats: stats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            data: requests
        });

    } catch (error) {
        console.error('❌ Get all requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
            error: error.message
        });
    }
};

// ==================== ADMIN - UPDATE STATUS ====================
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const request = await UserRequest.findByIdAndUpdate(
            id,
            {
                status,
                adminNote,
                reviewedAt: new Date()
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Update Telegram message
        if (request.telegramMessageId) {
            await updateRequestStatus(request.telegramMessageId, status, adminNote);
        }

        res.json({
            success: true,
            message: `Request ${status}`,
            data: request
        });

    } catch (error) {
        console.error('❌ Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

// ==================== ADMIN - DELETE REQUEST ====================
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await UserRequest.findByIdAndDelete(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            message: 'Request deleted'
        });

    } catch (error) {
        console.error('❌ Delete request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message
        });
    }
};

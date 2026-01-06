const Request = require('../models/Request');

// ================= USER - CREATE REQUEST =================
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
            imdbLink,
            tmdbId
        } = req.body;

        // Validation
        if (!userId || !userName || !contentType || !title) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, userName, contentType, title'
            });
        }

        // Check for duplicate pending request (same user, same title)
        const existingRequest = await Request.findOne({
            userId,
            title: { $regex: new RegExp(`^${title}$`, 'i') },
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this title'
            });
        }

        // Create new request
        const newRequest = new Request({
            userId,
            userName,
            userEmail,
            contentType,
            title,
            year,
            language,
            genre,
            description,
            imdbLink,
            tmdbId
        });

        await newRequest.save();

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully',
            data: newRequest
        });

    } catch (error) {
        console.error('❌ Create Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create request',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ================= USER - GET MY REQUESTS =================
exports.getMyRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        const requests = await Request.find({ userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
            error: error.message
        });
    }
};

// ================= ADMIN - GET ALL REQUESTS =================
exports.getAllRequests = async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const requests = await Request.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get stats
        const stats = await Request.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all requests',
            error: error.message
        });
    }
};

// ================= ADMIN - UPDATE REQUEST STATUS =================
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote, reviewedBy } = req.body;

        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "declined"'
            });
        }

        const request = await Request.findByIdAndUpdate(
            id,
            {
                status,
                adminNote,
                reviewedBy,
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

        res.json({
            success: true,
            message: `Request ${status} successfully`,
            data: request
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update request',
            error: error.message
        });
    }
};

// ================= ADMIN - DELETE REQUEST =================
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findByIdAndDelete(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            message: 'Request deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: error.message
        });
    }
};

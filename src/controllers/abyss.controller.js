const axios = require('axios');

const API_KEY = 'bae3b7ed62104a5c863a3c152c3ce8ba';
const API_BASE = 'https://api.abyss.to/v1';
const UPLOAD_URL = 'https://up.abyss.to';

// Get all videos
exports.getVideos = async (req, res) => {
    try {
        const { q = '', maxResults = 100, pageToken = '' } = req.query;

        const response = await axios.get(`${API_BASE}/resources`, {
            params: {
                key: API_KEY,
                type: 'files',
                q,
                maxResults,
                pageToken
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get video info
exports.getVideoInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(`${API_BASE}/files/${id}`, {
            params: { key: API_KEY }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Rename video
exports.renameVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const response = await axios.put(
            `${API_BASE}/files/${id}`,
            { name },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.delete(`${API_BASE}/files/${id}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Remote upload
exports.remoteUpload = async (req, res) => {
    try {
        const { fileId } = req.body;

        const response = await axios.post(
            `${API_BASE}/remote/${fileId}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Abyss API error:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Upload info (returns upload URL for frontend)
exports.getUploadUrl = async (req, res) => {
    try {
        res.json({
            uploadUrl: `${UPLOAD_URL}/${API_KEY}`,
            apiKey: API_KEY
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

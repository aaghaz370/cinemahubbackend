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

// Remote upload - supports Google Drive and direct URLs
exports.remoteUpload = async (req, res) => {
    try {
        const { url } = req.body;

        console.log('Remote upload request for URL:', url);

        // Extract Google Drive file ID if it's a GD link
        const gdMatch = url.match(/\/d\/([-\w]{25,})/);

        if (gdMatch) {
            // Google Drive upload
            const fileId = gdMatch[1];
            console.log('Detected Google Drive fileId:', fileId);

            const response = await axios.post(
                `${API_BASE}/remote/${fileId}?key=${API_KEY}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Abyss remote upload response:', response.data);
            res.json(response.data);
        } else {
            // For direct URLs, we need to download and re-upload
            // This is a workaround since Abyss only supports GD remote
            res.status(400).json({
                error: 'Direct URL remote upload not supported by Abyss API',
                message: 'Please use Google Drive links or upload files directly',
                supportedFormats: ['Google Drive'],
                alternativeHint: 'Upload file directly using the file upload option'
            });
        }
    } catch (error) {
        console.error('Abyss remote upload error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.msg || error.message,
            details: error.response?.data
        });
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

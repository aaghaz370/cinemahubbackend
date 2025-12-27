const axios = require('axios');
const FormData = require('form-data');

const API_KEY = '1bMix63fYVCSmkZA7ev7PfQcsPCu2fSr0FAQE7vybHHlQ7kB8HXYBPnFI5QAhKZf';
const API_BASE = 'https://voe.sx/api';

// ==================== ACCOUNT ====================
exports.getAccountInfo = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/account/info?key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Account info error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.getAccountStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/account/stats?key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== UPLOAD ====================
exports.getUploadServer = async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/upload/server?key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remoteUpload = async (req, res) => {
    try {
        const { url, folder_id } = req.body;
        console.log('📥 Remote upload:', url);

        let endpoint = `${API_BASE}/upload/url?key=${API_KEY}&url=${encodeURIComponent(url)}`;
        if (folder_id) endpoint += `&folder_id=${folder_id}`;

        const response = await axios.post(endpoint);
        console.log('✅ Added to queue');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Remote upload error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.getRemoteUploads = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;
        const response = await axios.get(`${API_BASE}/upload/url/list?key=${API_KEY}&page=${page}&limit=${limit}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== FILES ====================
exports.getFiles = async (req, res) => {
    try {
        const { page = 1, per_page = 100, fld_id = 0, name = '' } = req.query;

        let url = `${API_BASE}/file/list?key=${API_KEY}&page=${page}&per_page=${per_page}&fld_id=${fld_id}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Get files error:', error.response?.data);
        res.status(500).json({ error: error.message });
    }
};

exports.getFileInfo = async (req, res) => {
    try {
        const { file_code } = req.query;
        const response = await axios.get(`${API_BASE}/file/info?key=${API_KEY}&file_code=${file_code}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { file_code, title } = req.body;
        console.log('✏️ Rename:', file_code, '->', title);

        const response = await axios.get(`${API_BASE}/file/rename?key=${API_KEY}&file_code=${file_code}&title=${encodeURIComponent(title)}`);
        console.log('✅ Renamed');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Rename error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { del_code } = req.body;
        console.log('🗑️ Delete:', del_code);

        const response = await axios.get(`${API_BASE}/file/delete?key=${API_KEY}&del_code=${del_code}`);
        console.log('✅ Deleted');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Delete error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { file_code, fld_id } = req.body;
        const response = await axios.get(`${API_BASE}/file/set_folder?key=${API_KEY}&file_code=${file_code}&fld_id=${fld_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== FOLDERS ====================
exports.getFolders = async (req, res) => {
    try {
        const { fld_id = 0 } = req.query;
        const response = await axios.get(`${API_BASE}/folder/list?key=${API_KEY}&fld_id=${fld_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createFolder = async (req, res) => {
    try {
        const { name, parent_id = 0 } = req.body;
        console.log('📁 Create folder:', name);

        const response = await axios.get(`${API_BASE}/folder/create?key=${API_KEY}&parent_id=${parent_id}&name=${encodeURIComponent(name)}`);
        console.log('✅ Folder created');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create folder error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { fld_id, name } = req.body;
        const response = await axios.get(`${API_BASE}/folder/rename?key=${API_KEY}&fld_id=${fld_id}&name=${encodeURIComponent(name)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== CLONE ====================
exports.cloneFile = async (req, res) => {
    try {
        const { file_code, fld_id = 0 } = req.body;
        const response = await axios.get(`${API_BASE}/file/clone?key=${API_KEY}&file_code=${file_code}&fld_id=${fld_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

module.exports = exports;

const axios = require('axios');

const API_LOGIN = 'ac90649ce24f048465ac';
const API_KEY = 'koy9xprJj8hOK1j';
const API_BASE = 'https://api.streamtape.com';

// Helper to add credentials
const withAuth = (url) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}login=${API_LOGIN}&key=${API_KEY}`;
};

// ==================== ACCOUNT ====================
exports.getAccountInfo = async (req, res) => {
    try {
        const response = await axios.get(withAuth(`${API_BASE}/account/info`));
        res.json(response.data);
    } catch (error) {
        console.error('❌ Account error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

// ==================== FILES ====================
exports.listFolder = async (req, res) => {
    try {
        const { folder = '' } = req.query;
        let url = withAuth(`${API_BASE}/file/listfolder`);
        if (folder) url += `&folder=${folder}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('❌ List folder error:', error.response?.data);
        res.status(500).json({ error: error.message });
    }
};

exports.getFileInfo = async (req, res) => {
    try {
        const { file } = req.query;
        const response = await axios.get(withAuth(`${API_BASE}/file/info`) + `&file=${file}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renameFile = async (req, res) => {
    try {
        const { file, name } = req.body;
        console.log('✏️ Rename:', file, '->', name);

        const response = await axios.get(withAuth(`${API_BASE}/file/rename`) + `&file=${file}&name=${encodeURIComponent(name)}`);
        console.log('✅ Renamed');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Rename error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.moveFile = async (req, res) => {
    try {
        const { file, folder } = req.body;
        const response = await axios.get(withAuth(`${API_BASE}/file/move`) + `&file=${file}&folder=${folder}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { file } = req.body;
        console.log('🗑️ Delete:', file);

        const response = await axios.get(withAuth(`${API_BASE}/file/delete`) + `&file=${file}`);
        console.log('✅ Deleted');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Delete error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.getThumbnail = async (req, res) => {
    try {
        const { file } = req.query;
        const response = await axios.get(withAuth(`${API_BASE}/file/getsplash`) + `&file=${file}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== FOLDERS ====================
exports.createFolder = async (req, res) => {
    try {
        const { name, pid = '' } = req.body;
        console.log('📁 Create folder:', name);

        let url = withAuth(`${API_BASE}/file/createfolder`) + `&name=${encodeURIComponent(name)}`;
        if (pid) url += `&pid=${pid}`;

        const response = await axios.get(url);
        console.log('✅ Folder created');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Create folder error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.renameFolder = async (req, res) => {
    try {
        const { folder, name } = req.body;
        const response = await axios.get(withAuth(`${API_BASE}/file/renamefolder`) + `&folder=${folder}&name=${encodeURIComponent(name)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { folder } = req.body;
        const response = await axios.get(withAuth(`${API_BASE}/file/deletefolder`) + `&folder=${folder}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== UPLOAD ====================
exports.getUploadUrl = async (req, res) => {
    try {
        const { folder = '' } = req.query;
        let url = withAuth(`${API_BASE}/file/ul`);
        if (folder) url += `&folder=${folder}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== REMOTE UPLOAD ====================
exports.addRemoteUpload = async (req, res) => {
    try {
        const { url, folder = '', name = '' } = req.body;
        console.log('📥 Remote upload:', url);

        let endpoint = withAuth(`${API_BASE}/remotedl/add`) + `&url=${encodeURIComponent(url)}`;
        if (folder) endpoint += `&folder=${folder}`;
        if (name) endpoint += `&name=${encodeURIComponent(name)}`;

        const response = await axios.get(endpoint);
        console.log('✅ Added to remote queue');
        res.json(response.data);
    } catch (error) {
        console.error('❌ Remote upload error:', error.response?.data);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

exports.getRemoteStatus = async (req, res) => {
    try {
        const { id } = req.query;
        const response = await axios.get(withAuth(`${API_BASE}/remotedl/status`) + `&id=${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeRemoteUpload = async (req, res) => {
    try {
        const { id } = req.body;
        const response = await axios.get(withAuth(`${API_BASE}/remotedl/remove`) + `&id=${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==================== CONVERTS ====================
exports.getRunningConverts = async (req, res) => {
    try {
        const response = await axios.get(withAuth(`${API_BASE}/file/runningconverts`));
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFailedConverts = async (req, res) => {
    try {
        const response = await axios.get(withAuth(`${API_BASE}/file/failedconverts`));
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;

/**
 * User Request Model
 * For requesting movies/series to be added
 */

const mongoose = require('mongoose');
const { getUserDbConnection } = require('../config/db');

const requestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userEmail: String,
    userName: String,

    // Request Details
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['movie', 'series'],
        required: true
    },
    year: Number,
    imdbLink: String,
    description: String,

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    adminNote: String
}, {
    timestamps: true
});

let RequestModel = null;

const getRequest = () => {
    if (RequestModel) return RequestModel;

    const userDb = getUserDbConnection();
    if (userDb) {
        RequestModel = userDb.model('Request', requestSchema);
        return RequestModel;
    }

    return mongoose.model('Request', requestSchema);
};

module.exports = { getRequest };

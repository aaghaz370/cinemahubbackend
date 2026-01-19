/**
 * Security Middleware for CinemaHub API
 * Implements rate limiting, CORS, and protected routes
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// ================= RATE LIMITERS =================

// General API rate limit (prevent scraping)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limit for video access (prevent abuse)
const videoAccessLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 video accesses per 5 minutes
    message: {
        success: false,
        error: 'Too many video requests. Please wait a moment.'
    },
    skipSuccessfulRequests: false,
});

// Auth rate limit (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 minutes
    message: {
        success: false,
        error: 'Too many login attempts. Please try again later.'
    },
});

// ================= CORS CONFIGURATION =================
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from your domains only
        const allowedOrigins = [
            'https://cinemahub8.vercel.app',
            'https://cinemaadmin.vercel.app',
            'http://localhost:5173', // Development
            'http://localhost:5174', // Development (admin)
            'https://cinemahub.biz',
            'https://www.cinemahub.biz',
        ];


        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// ================= SECURITY HEADERS =================
const helmetConfig = helmet({
    contentSecurityPolicy: false, // Disable for now (can break frontend)
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = {
    apiLimiter,
    videoAccessLimiter,
    authLimiter,
    corsOptions,
    helmetConfig
};

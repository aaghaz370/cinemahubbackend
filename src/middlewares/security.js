/**
 * Security Middleware for CinemaHub Backend
 * Protects against common attacks while allowing high traffic
 */

const rateLimit = require("express-rate-limit");

// ================= SMART RATE LIMITING =================
// Different limits for different endpoints

// General API Rate Limit - High capacity for normal users
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute per IP (high for busy browsing)
    message: {
        error: "Too many requests. Please try again later.",
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip trusted proxies
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health' || req.path === '/health';
    }
});

// Strict Rate Limit - For sensitive operations (admin)
const strictLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for admin operations
    message: {
        error: "Too many admin requests. Please slow down.",
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth Rate Limit - Prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per 15 minutes
    message: {
        error: "Too many login attempts. Please try again later.",
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Search Rate Limit - Prevent search abuse
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 searches per minute
    message: {
        error: "Too many search requests. Please slow down.",
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ================= INPUT SANITIZATION =================
const sanitizeInput = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = {};
    for (const key in obj) {
        let value = obj[key];

        // Skip MongoDB operators if they're malicious
        if (key.startsWith('$')) continue;

        if (typeof value === 'string') {
            // Remove potential NoSQL injection patterns
            value = value
                .replace(/\$where/gi, '')
                .replace(/\$gt/gi, '')
                .replace(/\$lt/gi, '')
                .replace(/\$ne/gi, '')
                .replace(/\$regex/gi, '')
                .replace(/\$or/gi, '')
                .replace(/\$and/gi, '');

            // Limit string length
            value = value.slice(0, 5000);
        } else if (typeof value === 'object' && value !== null) {
            value = sanitizeInput(value);
        }

        sanitized[key] = value;
    }
    return sanitized;
};

// Middleware to sanitize request body/query/params
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
};

// ================= MONGO INJECTION PROTECTION =================
const mongoSanitize = (req, res, next) => {
    // Check for MongoDB operators in query params
    const checkForInjection = (obj) => {
        if (typeof obj !== 'object' || obj === null) return false;

        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                return true;
            }
            if (typeof obj[key] === 'object' && checkForInjection(obj[key])) {
                return true;
            }
        }
        return false;
    };

    if (checkForInjection(req.query) || checkForInjection(req.body)) {
        return res.status(400).json({
            error: "Invalid request parameters"
        });
    }

    next();
};

// ================= XSS PROTECTION =================
const xssProtection = (req, res, next) => {
    // Set XSS headers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
};

// ================= REQUEST SIZE LIMIT =================
const sizeLimitMiddleware = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxBytes = parseInt(maxSize) * 1024 * 1024;

        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: "Request too large"
            });
        }
        next();
    };
};

// ================= SUSPICIOUS REQUEST DETECTION =================
const suspiciousDetection = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const path = req.path.toLowerCase();

    // Block common attack patterns
    const blockedPatterns = [
        /\.env/i,
        /\.git/i,
        /wp-admin/i,
        /wp-login/i,
        /phpmyadmin/i,
        /\.php$/i,
        /\.asp$/i,
        /\.aspx$/i,
        /shell/i,
        /eval\(/i,
        /base64/i
    ];

    for (const pattern of blockedPatterns) {
        if (pattern.test(path)) {
            console.warn('🚨 Blocked suspicious request:', path, 'from:', req.ip);
            return res.status(403).json({ error: "Forbidden" });
        }
    }

    // Block empty or suspicious user agents
    if (!userAgent || userAgent.length < 10) {
        // Allow but log
        console.log('⚠️ Suspicious user agent:', userAgent, 'from:', req.ip);
    }

    next();
};

// ================= ERROR HANDLER (Hide internal errors) =================
const secureErrorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Don't expose internal error details
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? "Something went wrong"
            : err.message
    });
};

// ================= HEALTH CHECK =================
const healthCheck = (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    generalLimiter,
    strictLimiter,
    authLimiter,
    searchLimiter,
    sanitizeMiddleware,
    xssProtection,
    sizeLimitMiddleware,
    suspiciousDetection,
    secureErrorHandler,
    healthCheck
};

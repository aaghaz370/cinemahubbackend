const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const {
    generalLimiter,
    strictLimiter,
    authLimiter,
    searchLimiter,
    sanitizeMiddleware,
    xssProtection,
    suspiciousDetection,
    secureErrorHandler,
    healthCheck
} = require("./middlewares/security");

const personRoutes = require("./routes/person.routes");

const app = express();

// ================= TRUST PROXY (for rate limiting behind Render/Vercel) =================
app.set('trust proxy', 1);

// ================= SECURE CORS Configuration =================
const normalizeUrl = (url) => {
    if (!url) return url;
    return url.replace(/\/$/, '');
};

const allowedOrigins = [
    // Production URLs
    normalizeUrl(process.env.FRONTEND_URL),
    normalizeUrl(process.env.ADMIN_URL),

    // Development URLs
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',

    // Production URLs
    'https://cinemahub8.vercel.app',
    'https://cinemahub.vercel.app',
    'https://cinemahub-admin.vercel.app'
].filter(Boolean);

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        const normalizedOrigin = normalizeUrl(origin);

        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked:', normalizedOrigin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// ================= GLOBAL MIDDLEWARE =================
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================= SECURITY MIDDLEWARE =================
// Helmet - Security headers (XSS, clickjacking, etc.)
app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding videos
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Let frontend handle CSP
}));

// HPP - HTTP Parameter Pollution protection
app.use(hpp());

// MongoDB Injection Protection
app.use(mongoSanitize());

// Custom security middleware
app.use(xssProtection);           // Extra XSS headers
app.use(suspiciousDetection);      // Block suspicious requests
app.use(sanitizeMiddleware);       // Sanitize inputs

// ================= HEALTH CHECK (No rate limit) =================
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// ================= PUBLIC ROUTES (High rate limit) =================
app.use(generalLimiter);

app.use("/api", personRoutes);
app.use("/api", require("./routes/public.movie.routes"));
app.use("/api", require("./routes/public.series.routes"));
app.use("/api", require("./routes/home.routes"));
app.use("/api", require("./routes/view.routes"));
app.use("/api", require("./routes/trending.routes"));
app.use("/api", require("./routes/content.routes"));
app.use("/api/recommendations", require("./routes/recommendation.routes"));
app.use("/api/collections", require("./routes/collection.routes"));

// ================= USER ROUTES (Public - for logged in users) =================
app.use("/api", require("./routes/user.routes"));

// ================= SEARCH ROUTES (Medium rate limit) =================
app.use("/api", searchLimiter, require("./routes/search.routes"));

// ================= TRENDING ROUTES =================
app.use("/api/trending", require("./routes/trending.routes"));

// ================= AUTH ROUTES (Strict rate limit for login) =================
app.use("/api", require("./routes/auth.routes"));

// ================= ADMIN ROUTES (Protected, lower rate limit) =================
app.use("/api", require("./routes/admin.movie.routes"));
app.use("/api", require("./routes/admin.series.routes"));
app.use("/api", require("./routes/admin.movie.v2.routes"));
app.use("/api", require("./routes/admin.series.v2.routes"));
app.use("/api", require("./routes/abyss.routes"));
app.use("/api", require("./routes/voe.routes"));
app.use("/api", require("./routes/streamtape.routes"));

// ================= MIGRATION ROUTES (Run once to populate data) =================
app.use("/api", require("./routes/migration.routes"));

// ================= REQUEST ROUTES (Old - being deprecated) =================
app.use("/api/requests", require("./routes/request.routes"));

// ================= USER REQUEST ROUTES (New - Telegram integrated) =================
app.use("/api/user-requests", require("./routes/userRequest.routes"));

// ================= ERROR HANDLER =================
app.use(secureErrorHandler);

// ================= 404 HANDLER =================
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

console.log('🛡️ Security middleware loaded');

module.exports = app;

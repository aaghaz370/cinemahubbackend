const express = require("express");
const cors = require("cors");
const limiter = require("./middlewares/rateLimit");
const personRoutes = require("./routes/person.routes");

const app = express();

// 🔒 SECURE CORS Configuration
// Normalize URLs by removing trailing slashes
const normalizeUrl = (url) => {
    if (!url) return url;
    return url.replace(/\/$/, ''); // Remove trailing slash
};

const allowedOrigins = [
    // Production URLs (from environment variables)
    normalizeUrl(process.env.FRONTEND_URL),
    normalizeUrl(process.env.ADMIN_URL),

    // Development URLs
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',

    // Hardcoded production URLs as backup
    'https://cinemahub8.vercel.app',
    'https://cinemahub.vercel.app',
    'https://cinemahub-admin.vercel.app'
].filter(Boolean); // Remove undefined values

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Normalize the incoming origin too
        const normalizedOrigin = normalizeUrl(origin);

        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
            console.log('✅ CORS allowed:', normalizedOrigin);
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', normalizedOrigin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

app.use("/api", personRoutes);
app.use("/api", require("./routes/admin.movie.routes"));
app.use("/api", require("./routes/public.movie.routes"));
app.use("/api", require("./routes/admin.series.routes"));
app.use("/api", require("./routes/public.series.routes"));
app.use("/api", require("./routes/search.routes"));
app.use("/api/recommendations", require("./routes/recommendation.routes"));
app.use("/api", require("./routes/content.routes"));
app.use("/api", require("./routes/home.routes"));
app.use("/api", require("./routes/view.routes"));
app.use("/api", require("./routes/trending.routes"));
app.use("/api", require("./routes/admin.movie.v2.routes"));
app.use("/api", require("./routes/admin.series.v2.routes"));


module.exports = app;

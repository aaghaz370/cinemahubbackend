const express = require("express");
const cors = require("cors");
const limiter = require("./middlewares/rateLimit");
const personRoutes = require("./routes/person.routes");

const app = express();

// 🔒 SECURE CORS Configuration
const allowedOrigins = [
    // Production URLs
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,

    // Development URLs
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',

    // Add your production URLs manually as backup
    'https://cinemahub.vercel.app',
    'https://cinemahub-admin.vercel.app'
].filter(Boolean); // Remove undefined values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.) in development
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
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

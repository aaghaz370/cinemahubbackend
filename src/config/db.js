const mongoose = require("mongoose");
require("dotenv").config(); // Ensure env vars are loaded

// Main Content Database (Movies, Series, Admin)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Content MongoDB Connected");
  } catch (err) {
    console.error("❌ Content MongoDB Error:", err.message);
    process.exit(1);
  }
};

// User Database Connection (Watchlist, History, Profiles)
let userDbConnection = null;

const USER_DB_URI = process.env.USER_MONGO_URI;

if (USER_DB_URI) {
  // Initialize immediately so models can attach to it
  userDbConnection = mongoose.createConnection(USER_DB_URI);

  userDbConnection.on('connected', () => {
    console.log("✅ User MongoDB Connected");
  });

  userDbConnection.on('error', (err) => {
    console.error("❌ User MongoDB Error:", err.message);
  });
} else {
  console.log("⚠️ USER_MONGO_URI not set - User features will use localStorage only");
}

const connectUserDB = async () => {
  // Just a placeholder now to keep existing flow waiting if needed
  if (!userDbConnection) return null;
  return userDbConnection;
};

const getUserDbConnection = () => userDbConnection;

module.exports = { connectDB, connectUserDB, getUserDbConnection };

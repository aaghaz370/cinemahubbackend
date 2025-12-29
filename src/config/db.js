const mongoose = require("mongoose");

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

const connectUserDB = async () => {
  try {
    const USER_DB_URI = process.env.USER_MONGO_URI;

    if (!USER_DB_URI) {
      console.log("⚠️ USER_MONGO_URI not set - User features will use localStorage only");
      return null;
    }

    userDbConnection = mongoose.createConnection(USER_DB_URI);

    userDbConnection.on('connected', () => {
      console.log("✅ User MongoDB Connected");
    });

    userDbConnection.on('error', (err) => {
      console.error("❌ User MongoDB Error:", err.message);
    });

    return userDbConnection;
  } catch (err) {
    console.error("❌ User MongoDB Connection Error:", err.message);
    return null;
  }
};

const getUserDbConnection = () => userDbConnection;

module.exports = { connectDB, connectUserDB, getUserDbConnection };

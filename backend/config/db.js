require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use MONGO_LOCAL_URI if defined, otherwise fall back to MONGO_URI
    const mongoUri = process.env.MONGO_LOCAL_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "No MongoDB URI found. Please set MONGO_LOCAL_URI or MONGO_URI environment variable."
      );
    }

    console.log(`🔌 Connecting to MongoDB...`);
    console.log(
      `📍 Using URI type: ${process.env.MONGO_LOCAL_URI ? "LOCAL" : "REMOTE"}`
    );

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    console.log(
      `🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

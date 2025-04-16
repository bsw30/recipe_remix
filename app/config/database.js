const mongoose = require("mongoose")

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("✅ MongoDB connected")
  } catch (err) {
    console.error("❌ MongoDB error:", err)
    process.exit(1)
  }
}

module.exports = connectDB
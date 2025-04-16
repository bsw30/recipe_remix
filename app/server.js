const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration - directly in server.js
app.use(
  session({
    secret: process.env.SESSION_SECRET || "recipe-remix-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60, // = 14 days
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 2 weeks
      httpOnly: true,
      secure: false, // Must be false for HTTP connections
      sameSite: "lax", // Changed from strict to lax for better compatibility
    },
    name: "recipe.sid", // Custom name to avoid conflicts
  }),
)

// Set up EJS as the view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log(`Session ID: ${req.session.id}, User ID: ${req.session.userId || "none"}`)
  next()
})

// Routes
app.use("/auth", require("./routes/auth"))
app.use("/user", require("./routes/user"))
app.use("/recipes", require("./routes/recipe"))
app.use("/admin", require("./routes/admin"))
app.use("/", require("./routes/pages"))

// Add a debug route to check session status
app.get("/debug-session", (req, res) => {
  res.json({
    sessionId: req.session.id,
    userId: req.session.userId,
    username: req.session.username,
    isAuthenticated: !!req.session.userId,
    cookies: req.headers.cookie,
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

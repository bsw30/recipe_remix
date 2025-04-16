const User = require("../models/user")

// Authentication middleware with improved logging and handling
function isAuthenticated(req, res, next) {
  console.log("Authentication check - Session ID:", req.session.id)
  console.log("Authentication check - User ID in session:", req.session.userId)

  if (req.session && req.session.userId) {
    console.log("User is authenticated, proceeding to next middleware")
    return next()
  }

  console.log("Authentication failed - redirecting to login")

  // For API requests, return JSON
  if (req.xhr || (req.headers.accept && req.headers.accept.indexOf("json") > -1)) {
    return res.status(401).json({ error: "Unauthorized - Please log in" })
  }

  // For page requests, redirect to the home page
  res.redirect("/?auth=failed")
}

// Admin middleware
async function isAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" })

  try {
    const user = await User.findById(req.session.userId)
    if (!user) return res.status(401).json({ error: "User not found" })
    if (!user.isAdmin) return res.status(403).json({ error: "Forbidden - Admins only" })
    next()
  } catch (err) {
    console.error("Admin middleware error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  isAuthenticated,
  isAdmin,
}

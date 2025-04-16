const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { isAuthenticated } = require("../middleware/auth");

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/current-user", authController.getCurrentUser);

// Add a debug route to check session status
router.get("/session-check", (req, res) => {
  res.json({
    sessionId: req.session.id,
    userId: req.session.userId,
    username: req.session.username,
    isAuthenticated: !!req.session.userId,
  });
});

module.exports = router;
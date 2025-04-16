const express = require("express")
const router = express.Router()
const userController = require("../controllers/user")
const { isAuthenticated } = require("../middleware/auth")

// User routes
router.get("/stats", isAuthenticated, userController.getUserStats)
router.put("/profile", isAuthenticated, userController.updateProfile)

module.exports = router

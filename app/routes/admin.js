const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin")
const { isAdmin } = require("../middleware/auth")

// Admin routes
router.get("/users", isAdmin, adminController.getAllUsers)
router.delete("/recipes/:id", isAdmin, adminController.deleteRecipe)
router.get("/stats", isAdmin, adminController.getStats)

module.exports = router

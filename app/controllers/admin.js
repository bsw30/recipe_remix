const User = require("../models/user")
const Recipe = require("../models/recipe")

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-password")
    res.json(users)
  } catch (err) {
    console.error("Admin users error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Delete any recipe (admin privilege)
async function deleteRecipe(req, res) {
  try {
    const result = await Recipe.deleteOne({ _id: req.params.id })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    res.json({ message: "Recipe deleted by admin" })
  } catch (err) {
    console.error("Admin delete recipe error:", err)
    res.status(400).json({ error: err.message })
  }
}

// Get admin stats
async function getStats(req, res) {
  try {
    const userCount = await User.countDocuments()
    const recipeCount = await Recipe.countDocuments()
    res.json({ userCount, recipeCount })
  } catch (err) {
    console.error("Admin stats error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = {
  getAllUsers,
  deleteRecipe,
  getStats,
}

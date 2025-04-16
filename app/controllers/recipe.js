const Recipe = require("../models/recipe")
const User = require("../models/user")
const fs = require("fs")
const path = require("path")

// Create a new recipe
async function createRecipe(req, res) {
  try {
    const { title, description, ingredients, steps, prepTime, cookTime, servings, tags, isPrivate } = req.body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null

    // Parse JSON strings if needed
    const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients
    const parsedSteps = typeof steps === "string" ? JSON.parse(steps) : steps
    const parsedTags = tags ? (typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()) : tags) : []

    const recipe = await Recipe.create({
      title,
      description,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      prepTime: Number.parseInt(prepTime) || 0,
      cookTime: Number.parseInt(cookTime) || 0,
      servings: Number.parseInt(servings) || 1,
      tags: parsedTags,
      isPrivate: isPrivate === "true" || isPrivate === true,
      imageUrl,
      createdBy: req.session.userId,
    })
    res.status(201).json(recipe)
  } catch (err) {
    console.error("Create recipe error:", err)
    res.status(400).json({ error: err.message })
  }
}

// Get all public recipes
async function getAllRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ isPrivate: false }).populate("createdBy", "username")
    res.json(recipes)
  } catch (err) {
    console.error("Get recipes error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Get user's recipes
async function getUserRecipes(req, res) {
  try {
    const recipes = await Recipe.find({ createdBy: req.session.userId })
    res.json(recipes)
  } catch (err) {
    console.error("Get my recipes error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Get user's favorite recipes
async function getFavoriteRecipes(req, res) {
  try {
    const user = await User.findById(req.session.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const favorites = await Recipe.find({ _id: { $in: user.favorites || [] } }).populate("createdBy", "username")
    res.json(favorites)
  } catch (err) {
    console.error("Get favorites error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Add recipe to favorites
async function addToFavorites(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" })
    }

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $addToSet: { favorites: req.params.id } },
      { new: true },
    )

    res.json({ message: "Recipe added to favorites", favorites: user.favorites })
  } catch (err) {
    console.error("Favorite recipe error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Remove recipe from favorites
async function removeFromFavorites(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $pull: { favorites: req.params.id } },
      { new: true },
    )

    res.json({ message: "Recipe removed from favorites", favorites: user.favorites })
  } catch (err) {
    console.error("Unfavorite recipe error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

// Update a recipe
async function updateRecipe(req, res) {
  try {
    const { title, description, ingredients, steps, prepTime, cookTime, servings, tags, isPrivate } = req.body

    // Parse JSON strings if needed
    const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients
    const parsedSteps = typeof steps === "string" ? JSON.parse(steps) : steps
    const parsedTags = tags ? (typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()) : tags) : []

    const updates = {
      title,
      description,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      prepTime: Number.parseInt(prepTime) || 0,
      cookTime: Number.parseInt(cookTime) || 0,
      servings: Number.parseInt(servings) || 1,
      tags: parsedTags,
      isPrivate: isPrivate === "true" || isPrivate === true,
    }

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`
    }

    const recipe = await Recipe.findOneAndUpdate({ _id: req.params.id, createdBy: req.session.userId }, updates, {
      new: true,
    })

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found or unauthorized" })
    }

    res.json(recipe)
  } catch (err) {
    console.error("Update recipe error:", err)
    res.status(400).json({ error: err.message })
  }
}

// Delete a recipe
async function deleteRecipe(req, res) {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, createdBy: req.session.userId })

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found or unauthorized" })
    }

    // Delete the image file if it exists
    if (recipe.imageUrl && recipe.imageUrl.startsWith("/uploads/")) {
      const filename = recipe.imageUrl.split("/").pop()
      const filePath = path.join(__dirname, "..", "public", "uploads", filename)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await Recipe.deleteOne({ _id: req.params.id })

    res.json({ message: "Recipe deleted successfully" })
  } catch (err) {
    console.error("Delete recipe error:", err)
    res.status(400).json({ error: err.message })
  }
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getUserRecipes,
  getFavoriteRecipes,
  addToFavorites,
  removeFromFavorites,
  updateRecipe,
  deleteRecipe,
}

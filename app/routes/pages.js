const express = require("express")
const router = express.Router()
const path = require("path")
const { isAuthenticated } = require("../middleware/auth")

// Page routes - updated to use EJS
router.get("/", (req, res) => {
  res.render("index", {
    title: "Recipe Remix - Transform Your Cooking",
    description:
      "Discover, customize, and share recipes tailored to your taste, dietary needs, and available ingredients.",
  })
})

// Dashboard route
router.get("/dashboard", (req, res) => {
  console.log("Dashboard route - Session:", {
    id: req.session.id,
    userId: req.session.userId,
    username: req.session.username,
  })

  if (!req.session.userId) {
    console.log("User not authenticated, redirecting to home")
    return res.redirect("/?auth=required")
  }

  console.log("User authenticated, rendering dashboard")
  res.render("dashboard", {
    username: req.session.username,
    userId: req.session.userId,
  })
})

// Profile page - protected route
router.get("/profile", isAuthenticated, (req, res) => {
  console.log("Accessing profile page - User ID:", req.session.userId)
  res.render("profile", {
    title: "User Profile - Recipe Remix",
    description: "Manage your Recipe Remix profile, recipes, and favorites.",
  })
})

// Recipes page - public route
router.get("/recipes", (req, res) => {
  console.log("Accessing recipes page")
  res.render("recipes", {
    title: "Recipes - Recipe Remix",
    description: "Discover and explore delicious recipes from our community",
  })
})

// About page - public route
router.get("/about", (req, res) => {
  console.log("Accessing about page")
  res.render("about", {
    title: "About - Recipe Remix",
    description: "Learn about Recipe Remix and our mission to transform cooking",
  })
})

// Contact page - public route
router.get("/contact", (req, res) => {
  console.log("Accessing contact page")
  res.render("contact", {
    title: "Contact Us - Recipe Remix",
    description: "Get in touch with the Recipe Remix team",
  })
})

module.exports = router


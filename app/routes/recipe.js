const express = require("express")
const router = express.Router()
const recipeController = require("../controllers/recipe")
const { isAuthenticated } = require("../middleware/auth")
const multer = require("multer")
const path = require("path")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed!"))
  },
})

// Recipe routes
router.post("/", isAuthenticated, upload.single("image"), recipeController.createRecipe)
router.get("/", recipeController.getAllRecipes)
router.get("/mine", isAuthenticated, recipeController.getUserRecipes)
router.get("/favorites", isAuthenticated, recipeController.getFavoriteRecipes)
router.post("/:id/favorite", isAuthenticated, recipeController.addToFavorites)
router.delete("/:id/favorite", isAuthenticated, recipeController.removeFromFavorites)
router.put("/:id", isAuthenticated, upload.single("image"), recipeController.updateRecipe)
router.delete("/:id", isAuthenticated, recipeController.deleteRecipe)

module.exports = router

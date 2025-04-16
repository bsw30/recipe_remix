const mongoose = require("mongoose")

const recipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: [String],
  steps: [String],
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  tags: [String],
  isPrivate: Boolean,
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [
    {
      text: String,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
})

module.exports = mongoose.model("Recipe", recipeSchema)

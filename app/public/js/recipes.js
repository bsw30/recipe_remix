document.addEventListener("DOMContentLoaded", async () => {
  const lucide = window.lucide
  const bootstrap = window.bootstrap

  let currentUser = null
  let editRecipeId = null

  // Initialize Bootstrap modals
  const addRecipeModalElement = document.getElementById("addRecipeModal")
  const addRecipeModal = addRecipeModalElement ? new bootstrap.Modal(addRecipeModalElement) : null

  // Get current user
  try {
    const res = await fetch("/auth/current-user", {
      credentials: "include",
      headers: { "Cache-Control": "no-cache" },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        currentUser = data.user
      }
    }
  } catch (err) {
    console.error("Error fetching current user:", err)
  }

  async function loadRecipes(view = "all") {
    let endpoint = "/recipes"
    if (view === "mine") endpoint = "/recipes/mine"
    else if (view === "favorites") endpoint = "/recipes/favorites"

    try {
      const res = await fetch(endpoint, { credentials: "include" })
      const recipes = await res.json()
      const recipeGrid = document.querySelector(".recipes-grid")

      if (!recipeGrid) return // Not on a page with recipes grid

      recipeGrid.innerHTML = ""

      if (recipes.length === 0) {
        recipeGrid.innerHTML = `
          <div class="col-12 text-center py-5">
            <p class="text-muted">No recipes found</p>
          </div>
        `
        return
      }

      recipes.forEach((recipe) => {
        const card = document.createElement("div")
        card.className = "recipe-card"
        const isOwner = currentUser && recipe.createdBy?._id === currentUser._id

        card.innerHTML = `
          <div class="recipe-image-container">
            <img src="${recipe.imageUrl || "/placeholder.svg?height=300&width=400"}" alt="${recipe.title}" />
            <div class="recipe-original">
              <p>${isOwner ? "Created: " : "By: "}<span>${isOwner ? new Date(recipe.createdAt).toLocaleDateString() : recipe.createdBy?.username || "Unknown"}</span></p>
            </div>
          </div>
          <div class="recipe-content">
            <h3 class="recipe-title">${recipe.title}</h3>
            <div class="recipe-tags">
              ${recipe.tags ? recipe.tags.map((tag) => `<span class="recipe-tag">${tag}</span>`).join("") : ""}
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn-link view-recipe" data-id="${recipe._id}">
                View Recipe
                <i data-lucide="chevron-right" class="btn-icon-small"></i>
              </button>
              <button class="btn btn-sm ${isOwner ? "btn-outline-secondary" : "btn-outline-danger"} favorite-btn" data-id="${recipe._id}">
                <i data-lucide="${isOwner ? "heart" : "heart"}" style="width: 14px; height: 14px;"></i>
                ${isOwner ? "Likes: 0" : "Favorite"}
              </button>
            </div>
            ${
              isOwner
                ? `
            <div class="recipe-actions">
              <button class="btn btn-sm btn-warning edit-btn" data-id="${recipe._id}" data-title="${recipe.title}" data-ingredients='${JSON.stringify(recipe.ingredients)}' data-steps='${JSON.stringify(recipe.steps)}' data-private="${recipe.isPrivate}">
                <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                Edit
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${recipe._id}">
                <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                Delete
              </button>
            </div>`
                : ""
            }
          </div>
        `
        recipeGrid.appendChild(card)
      })

      lucide.createIcons()

      // Add event listeners to recipe cards
      setupRecipeCardListeners(recipeGrid)
    } catch (err) {
      console.error("Failed to load recipes:", err)
    }
  }

  function setupRecipeCardListeners(recipeGrid) {
    // Favorite button
    recipeGrid.querySelectorAll(".favorite-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!currentUser) {
          alert("Please log in to favorite recipes")
          return
        }

        const recipeId = btn.dataset.id
        const res = await fetch(`/recipes/${recipeId}/favorite`, {
          method: "POST",
          credentials: "include",
        })

        if (res.ok) {
          alert("Added to favorites!")
          loadRecipes("favorites")
        } else {
          alert("Failed to favorite.")
        }
      })
    })

    // Delete button
    recipeGrid.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const recipeId = btn.dataset.id
        if (confirm("Are you sure you want to delete this recipe?")) {
          const res = await fetch(`/recipes/${recipeId}`, {
            method: "DELETE",
            credentials: "include",
          })

          if (res.ok) {
            alert("Recipe deleted successfully!")
            loadRecipes(document.location.pathname.includes("profile") ? "mine" : "all")
          } else {
            alert("Delete failed")
          }
        }
      })
    })

    // Edit button
    recipeGrid.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editRecipeId = btn.dataset.id
        document.getElementById("recipeTitle").value = btn.dataset.title
        document.getElementById("recipeIngredients").value = JSON.parse(btn.dataset.ingredients).join("\n")
        document.getElementById("recipeSteps").value = JSON.parse(btn.dataset.steps).join("\n")
        document.getElementById("recipePrivate").checked = btn.dataset.private === "true"
        if (addRecipeModal) addRecipeModal.show()
      })
    })
  }

  // Recipe form submission
  const recipeForm = document.getElementById("addRecipeForm")
  if (recipeForm) {
    recipeForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!currentUser) {
        alert("Please log in to add a recipe")
        return
      }

      const formData = new FormData(recipeForm)

      // Convert ingredients and steps from newline-separated to arrays
      const ingredientsText = document.getElementById("recipeIngredients").value
      const stepsText = document.getElementById("recipeSteps").value

      formData.delete("recipeIngredients")
      formData.delete("recipeSteps")

      formData.append("ingredients", JSON.stringify(ingredientsText.split("\n").filter((line) => line.trim() !== "")))
      formData.append("steps", JSON.stringify(stepsText.split("\n").filter((line) => line.trim() !== "")))

      try {
        const res = await fetch(editRecipeId ? `/recipes/${editRecipeId}` : "/recipes", {
          method: editRecipeId ? "PUT" : "POST",
          body: formData,
          credentials: "include",
        })

        if (res.ok) {
          alert(editRecipeId ? "Recipe updated successfully!" : "Recipe added successfully!")
          recipeForm.reset()
          editRecipeId = null
          if (addRecipeModal) addRecipeModal.hide()

          loadRecipes(document.location.pathname.includes("profile") ? "mine" : "all")
        } else {
          const data = await res.json()
          alert("Error: " + (data.error || "Unknown error"))
        }
      } catch (err) {
        console.error("Recipe submission error:", err)
        alert("Server error: " + err.message)
      }
    })
  }

  // Save recipe button
  const saveRecipeBtn = document.getElementById("saveRecipeBtn")
  if (saveRecipeBtn) {
    saveRecipeBtn.addEventListener("click", () => {
      document.getElementById("addRecipeForm").dispatchEvent(new Event("submit"))
    })
  }

  // Recipe view buttons
  const viewAllBtn = document.getElementById("view-all")
  const viewMineBtn = document.getElementById("view-mine")
  const viewFavoritesBtn = document.getElementById("view-favorites")

  if (viewAllBtn) viewAllBtn.addEventListener("click", () => loadRecipes("all"))
  if (viewMineBtn)
    viewMineBtn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Please log in to view your recipes")
        return
      }
      loadRecipes("mine")
    })
  if (viewFavoritesBtn)
    viewFavoritesBtn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Please log in to view your favorites")
        return
      }
      loadRecipes("favorites")
    })

  // Initialize recipes on page load if applicable
  if (document.querySelector(".recipes-grid")) {
    loadRecipes("all")
  }
})

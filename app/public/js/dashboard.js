document.addEventListener("DOMContentLoaded", async () => {
  const lucide = window.lucide

  // Initialize Lucide icons
  lucide.createIcons()

  // Set current year in footer
  const currentYearElement = document.getElementById("current-year")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }

  let currentUser = null

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
        updateDashboard(currentUser)
      } else {
        // Redirect to home if not logged in
        window.location.href = "/"
      }
    }
  } catch (err) {
    console.error("Error fetching current user:", err)
  }

  // Update dashboard with user info
  function updateDashboard(user) {
    // Update welcome message
    const welcomeUsername = document.getElementById("welcomeUsername")
    if (welcomeUsername) {
      welcomeUsername.textContent = user.displayName || user.username
    }

    // Update username display
    const displayUsername = document.getElementById("displayUsername")
    if (displayUsername) {
      displayUsername.textContent = user.username
    }

    // Load user stats
    loadUserStats()

    // Load trending recipes
    loadTrendingRecipes()

    // Load recipe of the day
    loadRecipeOfTheDay()
  }

  // Load user stats
  async function loadUserStats() {
    try {
      const res = await fetch("/user/stats", { credentials: "include" })
      if (res.ok) {
        const stats = await res.json()
        
        // Update recipe counts
        const myRecipesCount = document.getElementById("myRecipesCount")
        const favoritesCount = document.getElementById("favoritesCount")
        
        if (myRecipesCount) myRecipesCount.textContent = stats.recipesCount || 0
        if (favoritesCount) favoritesCount.textContent = stats.favoritesCount || 0
      }
    } catch (err) {
      console.error("Failed to load user stats:", err)
    }
  }

  // Load trending recipes
  async function loadTrendingRecipes() {
    try {
      const res = await fetch("/recipes", { credentials: "include" })
      const recipes = await res.json()
      const trendingContainer = document.querySelector(".trending-recipes-grid")
      const loadingElement = document.getElementById("trending-loading")

      if (loadingElement) loadingElement.style.display = "none"
      
      if (!trendingContainer) return

      // If no recipes, show message
      if (recipes.length === 0) {
        trendingContainer.innerHTML = `
          <div class="col-12 text-center py-3">
            <p class="text-muted">No recipes found</p>
          </div>
        `
        return
      }

      // Display up to 3 trending recipes
      const trendingRecipes = recipes.slice(0, 3)
      
      trendingContainer.innerHTML = ""
      
      trendingRecipes.forEach((recipe) => {
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
          </div>
        `
        trendingContainer.appendChild(card)
      })

      // Initialize Lucide icons in the newly added content
      lucide.createIcons()
    } catch (err) {
      console.error("Failed to load trending recipes:", err)
    }
  }

  // Load recipe of the day
  async function loadRecipeOfTheDay() {
    try {
      const res = await fetch("/recipes", { credentials: "include" })
      const recipes = await res.json()
      const recipeOfDayContainer = document.getElementById("recipe-of-day")
      const loadingElement = document.getElementById("recipe-of-day-loading")

      if (loadingElement) loadingElement.style.display = "none"
      
      if (!recipeOfDayContainer) return

      // If no recipes, show message
      if (recipes.length === 0) {
        recipeOfDayContainer.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted">No recipes found</p>
          </div>
        `
        return
      }

      // Get a random recipe for recipe of the day
      const randomIndex = Math.floor(Math.random() * recipes.length)
      const recipeOfDay = recipes[randomIndex]
      
      recipeOfDayContainer.innerHTML = `
        <div class="row">
          <div class="col-md-5 mb-3 mb-md-0">
            <img src="${recipeOfDay.imageUrl || "/placeholder.svg?height=300&width=400"}" alt="${recipeOfDay.title}" class="img-fluid rounded" />
          </div>
          <div class="col-md-7">
            <h4>${recipeOfDay.title}</h4>
            <p class="text-muted">By: ${recipeOfDay.createdBy?.username || "Unknown"}</p>
            <p>${recipeOfDay.description}</p>
            <div class="d-flex gap-3 text-muted small mb-3">
              <div><i data-lucide="clock" style="width: 14px; height: 14px;"></i> Prep: ${recipeOfDay.prepTime} min</div>
              <div><i data-lucide="timer" style="width: 14px; height: 14px;"></i> Cook: ${recipeOfDay.cookTime} min</div>
              <div><i data-lucide="users" style="width: 14px; height: 14px;"></i> Serves: ${recipeOfDay.servings}</div>
            </div>
            <button class="btn btn-primary view-recipe" data-id="${recipeOfDay._id}">View Full Recipe</button>
          </div>
        </div>
      `

      // Initialize Lucide icons in the newly added content
      lucide.createIcons()
    } catch (err) {
      console.error("Failed to load recipe of the day:", err)
    }
  }
})

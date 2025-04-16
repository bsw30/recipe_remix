document.addEventListener("DOMContentLoaded", async () => {
  const lucide = window.lucide
  const bootstrap = window.bootstrap

  let currentUser = null

  // Initialize Lucide icons
  lucide.createIcons()

  // Profile page specific elements
  const profileTabs = document.getElementById("profileTabs")
  const profileSettingsForm = document.getElementById("profileSettingsForm")
  const editProfileBtn = document.getElementById("edit-profile-btn")

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
        updateProfileInfo(currentUser)
      } else {
        // Redirect to home if not logged in
        window.location.href = "/"
      }
    }
  } catch (err) {
    console.error("Error fetching current user:", err)
  }

  function updateProfileInfo(user) {
    // Update profile header
    const profileName = document.querySelector(".profile-header h1")
    const profileUsername = document.querySelector(".profile-header .text-muted")
    const profileBio = document.querySelector(".profile-header p:not(.text-muted)")

    if (profileName) profileName.textContent = user.displayName || user.username
    if (profileUsername) profileUsername.textContent = "@" + user.username
    if (profileBio && user.bio) profileBio.textContent = user.bio

    // Update form fields
    if (profileSettingsForm) {
      const displayNameInput = document.getElementById("displayName")
      const usernameInput = document.getElementById("username")
      const emailInput = document.getElementById("email")
      const bioInput = document.getElementById("bio")

      if (displayNameInput) displayNameInput.value = user.displayName || user.username
      if (usernameInput) usernameInput.value = user.username
      if (emailInput) emailInput.value = user.email
      if (bioInput) bioInput.value = user.bio || ""

      // Set notification preferences
      if (user.notificationPreferences) {
        const notifyComments = document.getElementById("notifyComments")
        const notifyFavorites = document.getElementById("notifyFavorites")
        const notifyNewsletter = document.getElementById("notifyNewsletter")

        if (notifyComments) notifyComments.checked = user.notificationPreferences.comments
        if (notifyFavorites) notifyFavorites.checked = user.notificationPreferences.favorites
        if (notifyNewsletter) notifyNewsletter.checked = user.notificationPreferences.newsletter
      }

      // Set privacy settings
      if (user.privacySettings) {
        const privacyProfile = document.getElementById("privacyProfile")
        const privacyRecipes = document.getElementById("privacyRecipes")

        if (privacyProfile) privacyProfile.checked = user.privacySettings.publicProfile
        if (privacyRecipes) privacyRecipes.checked = user.privacySettings.showInSearch
      }
    }
  }

  // Load user stats
  async function loadUserStats() {
    try {
      const res = await fetch("/user/stats", { credentials: "include" })
      if (res.ok) {
        const stats = await res.json()
        document.getElementById("recipes-count").textContent = stats.recipesCount || 0
        document.getElementById("favorites-count").textContent = stats.favoritesCount || 0
        document.getElementById("followers-count").textContent = stats.followersCount || 0
        document.getElementById("following-count").textContent = stats.followingCount || 0
      }
    } catch (err) {
      console.error("Failed to load user stats:", err)
    }
  }

  // Profile settings form submission
  if (profileSettingsForm) {
    profileSettingsForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const displayName = document.getElementById("displayName").value
      const username = document.getElementById("username").value
      const email = document.getElementById("email").value
      const bio = document.getElementById("bio").value

      // Get notification preferences
      const notificationPreferences = {
        comments: document.getElementById("notifyComments").checked,
        favorites: document.getElementById("notifyFavorites").checked,
        newsletter: document.getElementById("notifyNewsletter").checked,
      }

      // Get privacy settings
      const privacySettings = {
        publicProfile: document.getElementById("privacyProfile").checked,
        showInSearch: document.getElementById("privacyRecipes").checked,
      }

      try {
        const res = await fetch("/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName,
            username,
            email,
            bio,
            notificationPreferences,
            privacySettings,
          }),
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          alert("Profile updated successfully!")
          updateProfileInfo(data.user)
        } else {
          const data = await res.json()
          alert("Update failed: " + (data.error || "Unknown error"))
        }
      } catch (err) {
        console.error("Profile update error:", err)
        alert("Server error: " + err.message)
      }
    })
  }

  // Edit profile button
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      const settingsTab = document.getElementById("settings-tab")
      bootstrap.Tab.getOrCreateInstance(settingsTab).show()
    })
  }

  // Initialize profile page
  if (profileTabs) {
    loadUserStats()
  }
})

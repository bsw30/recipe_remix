// Login form submission
const loginForm = document.getElementById("loginForm")
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const loginError = document.getElementById("loginError")

    // Reset error message
    if (loginError) {
      loginError.classList.add("d-none")
      loginError.textContent = ""
    }

    try {
      console.log("Submitting login form...")
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })

      const data = await res.json()
      console.log("Login response:", data)

      if (res.ok) {
        // Login successful
        console.log("Login successful, redirecting to dashboard")

        // Hide modal if it exists
        const loginModalElement = document.getElementById("loginModal")
        if (loginModalElement) {
          const loginModal = bootstrap.Modal.getInstance(loginModalElement)
          if (loginModal) {
            loginModal.hide()
          }
        }

        // Update UI for logged in user
        updateUIForUser({
          username: data.user.username,
          _id: data.user._id,
        })

        // Redirect after a short delay to ensure UI updates
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 300)
      } else {
        // Show error message
        if (loginError) {
          loginError.textContent = data.error || "Login failed"
          loginError.classList.remove("d-none")
        } else {
          alert(data.error || "Login failed")
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      if (loginError) {
        loginError.textContent = "Server error. Please try again."
        loginError.classList.remove("d-none")
      } else {
        alert("Server error. Please try again.")
      }
    }
  })
}

// Mock bootstrap if not available (e.g., testing environment)
if (typeof bootstrap === "undefined") {
  bootstrap = {
    Modal: {
      getInstance: (element) => {
        return {
          hide: () => {},
        }
      },
    },
  }
}

// Mock updateUIForUser if not available (e.g., testing environment)
if (typeof updateUIForUser === "undefined") {
  updateUIForUser = (user) => {
    console.log("updateUIForUser called with:", user)
  }
}

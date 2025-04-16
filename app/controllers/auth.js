const User = require("../models/user"); // Import the User model

// Register new user
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Set session upon registration
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    req.session.isAdmin = newUser.isAdmin || false;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error during registration:", err);
        return res.status(500).json({ error: "Server error during registration" });
      }

      // Remove password from response
      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: "User registered successfully",
        user: userResponse,
      });
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
}

// Login user
async function login(req, res) {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username });

    // Find user by username
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      console.log("Login failed: Invalid credentials for user:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Set session upon successful login
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.isAdmin = user.isAdmin || false;

    console.log("Login successful for user:", username);
    console.log("Session data set:", {
      id: req.session.id,
      userId: req.session.userId,
      username: req.session.username,
    });

    // Save the session and then send success response
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Server error during login" });
      }
      res.status(200).json({
        success: true,
        message: "Login successful",
        redirect: "/dashboard",
        user: {
          username: user.username,
          email: user.email,
          _id: user._id,
        },
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
}

// Logout user
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Server error during logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
}

// Get current user
async function getCurrentUser(req, res) {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select("-password");
      if (user) {
        return res.json({ user });
      } else {
        return res.status(404).json({ error: "User not found in session" });
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      return res.status(500).json({ error: "Server error fetching user" });
    }
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
}

module.exports = { login, register, logout, getCurrentUser };
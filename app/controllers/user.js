const User = require("../models/user");
const Recipe = require("../models/recipe");

const renderDashboard = async (req, res) => { // Changed to const renderDashboard
    // 1. Check for User Session (Important!)
    if (!req.session || !req.session.userId) {
        console.warn("Dashboard accessed without a valid session. Redirecting to home.");
        return res.redirect('/');
    }

    // 2. Extract User Data from Session
    const userId = req.session.userId;
    const username = req.session.username;
    const userDisplayName = req.session.displayName || username;

    try {
        // 3. Fetch user stats
        const recipesCount = await Recipe.countDocuments({ createdBy: userId });
        const favoritesCount = req.session.favorites ? req.session.favorites.length : 0; // Access from session
        const followersCount = req.session.followers ? req.session.followers.length : 0; // Access from session
        const followingCount = req.session.following ? req.session.following.length : 0; // Access from session

        // 4.  Optional: Fetch Additional User Data (If Needed)  -  Simplified for this example
        const userData = await User.findById(userId).select("-password").lean();  // Lean query for performance

        // 5. Render the view
        res.render('dashboard', {
            user: {
                username: username,
                displayName: userDisplayName,
                ...userData, // Spread the fetched user data
            },
            recipesCount,
            favoritesCount,
            followersCount,
            followingCount,
        });


    } catch (err) {
        console.error("Error fetching data for dashboard:", err);
        res.status(500).send("Server error: Could not retrieve dashboard data."); // Or redirect
    }
};

// Get user stats -  No longer directly used by a route, but could be used internally
async function getUserStats(req, res) {
    try {
        const userId = req.session.userId;  // Get from session
        const user = await User.findById(userId); // You might not even need this
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const recipesCount = await Recipe.countDocuments({ createdBy: userId });
        const favoritesCount = user.favorites ? user.favorites.length : 0;
        const followersCount = user.followers ? user.followers.length : 0;
        const followingCount = user.following ? user.following.length : 0;

        res.json({
            recipesCount,
            favoritesCount,
            followersCount,
            followingCount,
        });
    } catch (err) {
        console.error("User stats error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// Update user profile
async function updateProfile(req, res) {
    try {
        const { displayName, username, email, bio, notificationPreferences, privacySettings } = req.body;

        // Check if username is already taken (if changing)
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.session.userId } });
            if (existingUser) {
                return res.status(400).json({ error: "Username already taken" });
            }
        }

        // Check if email is already taken (if changing)
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already taken" });
            }
        }

        const updates = {};
        if (displayName) updates.displayName = displayName;
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (bio) updates.bio = bio;
        if (notificationPreferences) updates.notificationPreferences = notificationPreferences;
        if (privacySettings) updates.privacySettings = privacySettings;

        const user = await User.findByIdAndUpdate(req.session.userId, updates, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getUserStats,  // Export, but it's now used internally
    updateProfile,
    renderDashboard, // Export the renderDashboard function
};

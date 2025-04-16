const session = require("express-session");
const MongoStore = require("connect-mongo");

// Session configuration
function configureSession(app) {
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || "recipe-remix-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60, // = 14 days
      autoRemove: "native",
    }),

    name: "recipe.sid",
  };

  app.use(session(sessionConfig));

  // Debug middleware to log session data
  app.use((req, res, next) => {
    console.log(
      `Session ID: ${req.session.id}, User ID: ${req.session.userId || "none"}`
    );
    next();
  });
}

module.exports = configureSession;

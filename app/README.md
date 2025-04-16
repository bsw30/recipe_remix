# Recipe Remix

A web application for discovering, customizing, and sharing recipes tailored to your taste, dietary needs, and available ingredients.
Our slides here https://docs.google.com/presentation/d/1LOcMMxqia8UN06Nd0eUEZ2mDc6mSsrFwjTilkALQc04/edit?usp=sharing 
## Team Members

- Kasvitha Kalapati (kak600)
- Yuelyu Ji (yuj49)
- Brianna Williams (bsw30)

## Project Overview

Recipe Remix is a full-stack web application that allows users to discover, customize, and share cooking recipes. It features user authentication, recipe management (CRUD), image uploads, and admin-exclusive functionality such as viewing user lists, deleting any recipe, and accessing site-wide statistics. The project is built with Node.js, Express, and MongoDB Atlas, and deployed on Glitch.

## Features

- **User Authentication**

  - Register, log in, and log out securely using sessions and hashed passwords
  - Session persistence with express-session and connect-mongo
  - Fetch current user info on page load to keep users logged in

- **Profile Management**

  - Customizable user profiles
  - Privacy controls – toggle visibility to only you or others

- **Recipe Management**

  - Create, edit, delete, and view recipes
  - Upload recipe images using multer
  - Favorite/unfavorite recipes
  - View all recipes, own recipes, and favorites
  - Categorization/filters for recipes

- **Social Features**

  - Friend/social requests
  - Note function for recipes
  - Share recipes with others

- **Search Functionality**

  - Find recipes by name, ingredients, or categories

- **Admin Capabilities**
  - View all registered users (without passwords)
  - Delete any user's recipe
  - View site statistics (total users and total recipes)

## Project Structure

### Folder Breakdown:
- **`/config`**: Contains configuration files for the application, such as database connection settings (`database.js`) and session management (`session.js`).
- **`/controllers`**: Holds the application's controllers, which handle the business logic for different parts of the application (admin, authentication, recipes, users). They receive requests, interact with models, and send responses.
- **`/middleware`**: Contains middleware functions (`auth.js` in this case) that execute during the request-response cycle, often used for tasks like authentication and authorization.
- **`/models`**: Defines the structure and behavior of your data using Mongoose schemas (`recipe.js`, `user.js`) for interacting with the MongoDB database.
- **`/public`**: Stores static assets that are directly served to the client's browser.
  - **`/css`**: Contains stylesheets (`style.css`).
  - **`/js`**: Holds client-side JavaScript files for various functionalities.
- **`/routes`**: Defines the application's routes (API endpoints and page routes). These files map HTTP requests to specific controller functions for handling.
  - API routes (e.g., for `/api/recipes`, `/api/users`).
  - Page routes (e.g., `/`, `/about`, which render EJS views).
- **`/views`**: Contains the server-side rendered HTML templates using EJS (`.ejs` files) for dynamic content generation. The `/partials` subdirectory holds reusable template components.

### Root Level Files:

- `.env`: Stores sensitive environment-specific variables.
- `LICENSE`: Specifies the project's licensing information.
- `README.md`: Provides a description and instructions for the project.
- `package.json`: Manages project dependencies and scripts.
- `server.js`: The main file that starts the Express application and sets up the server.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a `.env` file in the root directory with the following variables:
   \`\`\`
   PORT=3000
   MONGO_URL=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   \`\`\`
4. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`
5. For production:
   \`\`\`
   npm start
   \`\`\`

## Deployment (Glitch)

- Upload or connect your project to Glitch
- In the .env section of Glitch, add the same variables as above
- Use your Glitch live site URL (e.g. https://recipe-remix.glitch.me) to access the app
- Always test outside of the Glitch editor to avoid iframe and cookie issues

## Technologies Used

### Backend

- Node.js + Express
- MongoDB Atlas + Mongoose
- Session management with express-session, connect-mongo
- Image uploads with multer
- Password hashing with bcryptjs

### Frontend

- HTML, Bootstrap 5, Tailwind CSS
- JavaScript (ES6+)
- Lucide Icons

## Team Notes

### Brianna's Notes

- Currently using Bootstrap and Lucide for the frontend
- Reorganized folders due to long code

### Yuelyu's Notes

- The application features full-stack functionality with Node.js, Express, and MongoDB Atlas
- Admin endpoints include:
  - GET /admin/users – List all users (admin only)
  - DELETE /admin/recipes/:id – Delete any recipe by ID (admin only)
  - GET /admin/stats – Return user and recipe counts (admin only)

## Future Improvements

- Full-text search and filtering
- Enhanced user profile pages
- Recipe ratings and comments
- Convert frontend to React or Vue
- Improved categorization system
- Enhanced social features

## License

MIT

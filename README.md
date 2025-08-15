Just a fun project to make backend for a platform similar to youtube


# Backend Clone of YouTube

This project is a backend clone inspired by YouTube, built using **Node.js** and **Express**, with **MongoDB** as the database. It provides API endpoints for managing videos, users, comments, and authentication, similar to YouTube functionality.

---

## Features

- User authentication (JWT-based)
- Video upload and management(using cloudinary)
- Commenting on videos(in progress)
- Like/Dislike system for videos(still in progress)
- MongoDB database integration
- RESTful API design

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas or local)
- **Authentication:** JWT
- **Other:** dotenv for environment variables

---

## Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/DevaP06/backend_clone_yt.git
cd backend_clone_yt

### 2. Install dependencies
npm install


### 3. Create a .env file
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret


### 4. start the server
npm run dev



License

This project is open-source and free to use.
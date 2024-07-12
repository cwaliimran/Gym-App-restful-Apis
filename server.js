require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const express = require("express");
const connectToDB = require("./helperUtils/server-setup");

const workoutRoutes = require("./routes/workouts");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const groupMessageRoutes = require("./routes/groupMessageRoutes");
const {sendResponse} = require("./helperUtils/responseUtil");

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Express app
const app = express();

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, `access-${new Date().toISOString().slice(0, 10)}.log`),
  { flags: "a" }
);

// Morgan middleware for request logging to file
app.use(morgan("combined", { stream: accessLogStream }));

// Morgan middleware for request logging to console
app.use(morgan("dev"));

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/workouts", workoutRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/upload/details", uploadRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/group/message", groupMessageRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendResponse(res, err.statusCode || 500, err.message || 'Internal Server Error');
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
   sendResponse(res, 404, "Route Not Found");
});

// Connect to MongoDB and start server
connectToDB(app);

// Export your app for testing or other modules
module.exports = app;


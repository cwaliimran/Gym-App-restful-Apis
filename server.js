require("dotenv").config();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const express = require("express");
const workoutRoutes = require("./routes/workouts");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const mongoose = require("mongoose");

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

//express app
const app = express();
// Create a write stream for logging
const accessLogStream = fs.createWriteStream(path.join(logsDir, `access-${new Date().toISOString().slice(0, 10)}.log`), { flags: 'a' });

// Morgan middleware for request logging to file
app.use(morgan('combined', { stream: accessLogStream }));

// Morgan middleware for request logging to console
app.use(morgan('dev'));


//middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//Routes
app.use("/api/workouts", workoutRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


// Middleware to handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: "Route Not Found" });
});

//connect to db
mongoose
  .connect(process.env.BASE_URL)
  .then(() => {
    //listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });


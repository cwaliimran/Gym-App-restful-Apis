require("dotenv").config();
const express = require("express");
const workoutRoutes = require("./routes/workouts");
const workoutPlanRoutes = require("./routes/workoutPlanRoutes");
const mongoose = require("mongoose");

//express app
const app = express();

//middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/workouts", workoutRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);

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

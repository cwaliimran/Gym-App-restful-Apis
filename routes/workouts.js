const express = require("express");
const auth = require("../middlewares/authMiddleware");
const {
  createWorkout,
  getWorkouts,
  getWorkout,
  deleteWorkout,
  updateWorkout,
} = require("../controllers/workoutController");
const router = express.Router();

//get all workouts
router.get("/", auth, getWorkouts);
//get a single workout
router.get("/:id", auth, getWorkout);
//post workout
router.post("/", auth, createWorkout);
//delete workout
router.delete("/:id", auth, deleteWorkout);
//update a workout
router.patch("/:id", auth, updateWorkout);

module.exports = router;

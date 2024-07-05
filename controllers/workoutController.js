const Workout = require("../models/workoutModel");
const mongoose = require("mongoose");

//get all workouts

const getWorkouts = async (req, res) => {
  const workouts = await Workout.find({}).sort({ createdAt: -1 });
  return res.status(200).json(workouts);
};

//get a single workout

const getWorkout = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }
  const workout = await Workout.findById(id);
  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }
  return res.status(200).json(workout);
};

//create a new workout
const createWorkout = async (req, res) => {
  console.log("pos==========>", req.body);
  const { title, load, reps } = req.body;
  try {
    const workout = await Workout.create({ title, load, reps });
    return res.status(200).json(workout);
  } catch (error) {
    return res.status(400).json({ err: error.message });
  }
};

//delete a workout
const deleteWorkout = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }
  const workout = await Workout.findByIdAndDelete(id);
  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }
  return res.status(200).json(workout);
};

//update a workout

const updateWorkout = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" });
  }
  const { title, load, reps } = req.body;

  const workout = await Workout.findByIdAndUpdate(
    { _id: id },
    {
      title,
      reps,
      load,
    },
    { new: true }
  );
  if (!workout) {
    return res.status(404).json({ error: "No such workout" });
  }
  return res.status(200).json(workout);
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  deleteWorkout,
  updateWorkout,
};

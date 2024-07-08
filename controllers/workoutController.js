const Workout = require("../models/workoutModel");
const mongoose = require("mongoose");
const {
  sendResponse,
  parsePaginationParams,
  generateMeta,
} = require("../helperUtils/responseUtil");

//get all workouts
const getWorkouts = async (req, res) => {
  const { page, limit } = parsePaginationParams(req);

  try {
    const data = await Workout.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Workout.countDocuments({});
    const meta = generateMeta(page, limit, total);
    sendResponse(res, 200, "Workouts fetched successfully", data, meta);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
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

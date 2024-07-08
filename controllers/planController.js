const Plan = require("../models/planModel");
const mongoose = require("mongoose");
const {
  sendResponse,
  parsePaginationParams,
  generateMeta,
} = require("../helperUtils/responseUtil");
//get all plans

const getPlans = async (req, res) => {
  const { page, limit } = parsePaginationParams(req);

  try {
    const data = await Plan.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Plan.countDocuments({});
    const meta = generateMeta(page, limit, total);
    sendResponse(res, 200, "Plans fetched successfully", data, meta);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

//get a single plan

const getPlan = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such plan" });
  }
  const plan = await Plan.findById(id);
  if (!plan) {
    return res.status(404).json({ error: "No such plan" });
  }
  return res.status(200).json(plan);
};

//create a new plan
const createPlan = async (req, res) => {
  console.log("pos==========>", req.body);
  const { title, intensity, benefits } = req.body;
  try {
    const plan = await Plan.create({ title, intensity, benefits });
    return res.status(200).json(plan);
  } catch (error) {
    return res.status(400).json({ err: error.message });
  }
};

//delete a plan
const deletePlan = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such plan" });
  }
  const plan = await Plan.findByIdAndDelete(id);
  if (!plan) {
    return res.status(404).json({ error: "No such plan" });
  }
  return res.status(200).json(plan);
};

//update a plan

const updatePlan = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such plan" });
  }
  const { title, intensity, benefits } = req.body;

  const plan = await Plan.findByIdAndUpdate(
    { _id: id },
    {
      title,
      intensity,
      benefits,
    },
    { new: true }
  );
  if (!plan) {
    return res.status(404).json({ error: "No such plan" });
  }
  return res.status(200).json(plan);
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  deletePlan,
  updatePlan,
};

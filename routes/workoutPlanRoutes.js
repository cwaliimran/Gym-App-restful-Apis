const express = require("express");
const auth = require("../middlewares/authMiddleware");

const {
  createPlan,
  getPlans,
  getPlan,
  deletePlan,
  updatePlan,
} = require("../controllers/planController");
const router = express.Router();

//get all Plans
router.get("/", auth, getPlans);
//get a single Plan
router.get("/:id",auth, getPlan);
//post Plan
router.post("/",auth, createPlan);
//delete Plan
router.delete("/:id",auth, deletePlan);
//update a Plan
router.patch("/:id",auth, updatePlan);

module.exports = router;

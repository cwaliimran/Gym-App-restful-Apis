const express = require("express");
const {
  createPlan,
  getPlans,
  getPlan,
  deletePlan,
  updatePlan,
} = require("../controllers/planController");
const router = express.Router();

//get all Plans
router.get("/", getPlans);
//get a single Plan
router.get("/:id", getPlan);
//post Plan
router.post("/", createPlan);
//delete Plan
router.delete("/:id", deletePlan);
//update a Plan
router.patch("/:id", updatePlan);

module.exports = router;

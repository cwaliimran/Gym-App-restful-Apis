const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const planSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    intensity: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);

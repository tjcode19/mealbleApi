const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const mealSchema = require("../models/Meal");

const daySchema = new mongoose.Schema({
  meals: {
    type: [mealSchema],
    required: true,
  },
});

const timetableSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: {
    type: [daySchema],
    required: true,
  },
});

module.exports = mongoose.model("Timetable", timetableSchema);

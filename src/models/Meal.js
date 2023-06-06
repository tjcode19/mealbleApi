const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const MealSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", MealSchema);

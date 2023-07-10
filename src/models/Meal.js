const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const MealSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Array,
      required: true,
    },
    extra: {
      type: Array,
      required: true,
    },
    nutrients: {
      type: Array,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", MealSchema);

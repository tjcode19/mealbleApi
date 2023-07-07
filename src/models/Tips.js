const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const TipSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    content: {
      type: String,
      required: true,
    },
    active: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tip", MealSchema);

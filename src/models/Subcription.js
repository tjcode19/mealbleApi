const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const SubscriptionSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "7 Days",
    },
    price: {
      type: String,
    },
    dob: {
      type: String,
    },
    otp: {
      type: String,
    },
    country: {
      type: String,
    },

    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);

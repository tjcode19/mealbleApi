const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const SubscriptionSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    period: {
      type: {
        week: {
          duration: Number,
          price: Number,
          shuffle: Number,
        },
        month: {
          duration: Number,
          price: Number,
          shuffle: Number,
        },
      },
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);

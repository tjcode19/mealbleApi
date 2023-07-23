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
          id: { type: String, default: "WK" },
          duration: Number,
          price: Number,
          shuffle: Number,
          playId: String,
          appleId: String,
          regenerate: Number,
        },
        month: {
          id: { type: String, default: "MT" },
          duration: Number,
          price: Number,
          shuffle: Number,
          playId: String,
          appleId: String,
          regenerate: Number,
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

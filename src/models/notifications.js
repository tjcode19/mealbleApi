const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "All",
    },
    category: {
      type: String,
      default: "Message",
      enum: ["Tip", "Broadcast"],
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

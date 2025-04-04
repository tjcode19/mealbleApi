const { validateEmail } = require("../utils/utils");
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    firstName: {
      type: String,
      default: "Guest",
    },
    lastName: {
      type: String,
      default: "User",
    },
    auth: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    phoneNumber: {
      type: String,
    },
    dob: {
      type: String,
    },
    otp: {
      type: String,
    },
    gender: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    country: {
      type: String,
    },
    tribes: {
      type: Array,
      default: ["Hausa", "Igbo", "Yoruba"],
    },
    usedFree: {
      type: Boolean,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

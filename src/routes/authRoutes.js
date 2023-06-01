const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController");
const authController = new AuthController();
const { isAdmin, authenticate } = require("../middleware/auth");

/* GET users listing. */
router.route("/send-otp").post(authController.sendOtp.bind(authController));
router
  .route("/set-password")
  .post(authController.setPassword.bind(authController));
router
  .route("/change-password")
  .post(authenticate, authController.changePassword.bind(authController));
router.route("/").post(authController.login.bind(authController));

module.exports = router;

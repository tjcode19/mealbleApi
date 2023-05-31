const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController");
const authController = new AuthController();
// const { isAdmin, authenticate } = require("../middleware/auth");

/* GET users listing. */
router.route("/").post(authController.login.bind(authController));

module.exports = router;

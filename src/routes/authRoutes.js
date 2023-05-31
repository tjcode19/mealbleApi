const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
// const { isAdmin, authenticate } = require("../middleware/auth");

/* GET users listing. */
router.route("/").post(authController.login);

module.exports = router;

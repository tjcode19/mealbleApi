const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
// const { isAdmin, authenticate } = require("../middleware/auth");
const userController = new UserController();

/* GET users listing. */
router.route("/").post(userController.createUser.bind(userController));
router.route("/:id").get(mealController.getById.bind(userController));
router.route("/").get(userController.getAllUsers.bind(userController));

module.exports = router;

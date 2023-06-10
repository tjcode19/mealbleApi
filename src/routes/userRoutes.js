const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const { isAdmin, authenticate } = require("../middleware/auth");
const userController = new UserController();

/* GET users listing. */
router.route("/verify").post(userController.verifyEmail.bind(userController));
router.route("/").post(userController.createUser.bind(userController));
router
  .route("/:id")
  .get( userController.getUserById.bind(userController));
router
  .route("/:id")
  .patch(userController.updateUser.bind(userController));
router
  .route("/:id")
  .delete(isAdmin, userController.deleteUser.bind(userController));
router.route("/").get( userController.getAllUsers.bind(userController));

module.exports = router;

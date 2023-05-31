const express = require("express");
const router = express.Router();
const mealController = require("../controller/mealController");
// const { isAdmin, authenticate } = require("../middleware/auth");

/* GET users listing. */
router.route("/").post(mealController.create);
// router.route("/:id").get(mealController.getById);
router.route("/").get(mealController.getAll);

module.exports = router;

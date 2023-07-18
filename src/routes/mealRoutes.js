const express = require("express");
const router = express.Router();
const MealController = require("../controller/mealController");
const multer = require('multer');
const upload = multer({ dest: '../uploadNew/' });
// const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new MealController();

/* GET users listing. */
router.route("/upload").post(upload.single('image'), controller.uploadFile.bind(controller)), 
router.route("/").post(controller.create.bind(controller));
router.route("/:id").patch(controller.update.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router.route("/:id").get(controller.getById.bind(controller));
router.route("/filter/:tag").get(controller.getByTag.bind(controller));
router.route("/").get(controller.getAll.bind(controller));

module.exports = router;

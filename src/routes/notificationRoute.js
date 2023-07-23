const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/notificationController");
// const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new NotificationController();

/* GET users listing. */
router.route("/").post(controller.sendMessage.bind(controller));
router.route("/:id").patch(controller.update.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router.route("/:id").get(controller.getById.bind(controller));
router.route("/filter/:tag").get(controller.getByTag.bind(controller));
router.route("/").get(controller.getAll.bind(controller));

module.exports = router;
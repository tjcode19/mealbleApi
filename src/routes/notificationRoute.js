const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/notificationController");
// const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new NotificationController();

/* GET users listing. */
router.route("/send-email").post(controller.sendEmail.bind(controller));
router.route("/").post(controller.sendMessage.bind(controller));
router.route("/:id").patch(controller.update.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router.route("/:id").get(controller.getByUser.bind(controller));
router.route("/").get(controller.getAll.bind(controller));

module.exports = router;

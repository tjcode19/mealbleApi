const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/notificationController");
const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new NotificationController();

/* GET users listing. */
router.route("/send-email").post(controller.sendEmail.bind(controller));
router.route("/send-push").post(controller.sendPush.bind(controller));
router.route("/").post(controller.createMessage.bind(controller));

router.route("/:id").patch(controller.update.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router.route("/tips").get(authenticate, controller.getTips.bind(controller));
router
  .route("/messages")
  .get(authenticate, controller.getNotifications.bind(controller));
router.route("/:id").get(authenticate, controller.getByUser.bind(controller));
router.route("/").get(controller.getAll.bind(controller));

module.exports = router;

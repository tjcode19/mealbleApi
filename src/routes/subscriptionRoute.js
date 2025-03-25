const express = require("express");
const router = express.Router();
const SubscriptionController = require("../controller/subscriptionController");
const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new SubscriptionController();

/* GET users listing. */
router
  .route("/verify-purchase")
  .post(controller.verifyPurchase.bind(controller));
router.route("/google-rtdn").post(controller.googleRTDN.bind(controller));
router.route("/apple-rtdn").post(controller.appleRTDN.bind(controller));
router
  .route("/acknowledge-purchase")
  .post(controller.acknowledgePurchase.bind(controller));
// router.route("/").post(controller.create.bind(controller));
router.route("/:id").patch(controller.update.bind(controller));
// router.route("/:id").delete(controller.delete.bind(controller));
// router.route("/:id").get(controller.getById.bind(controller));
router.route("/").get(authenticate, controller.getAll.bind(controller));
// router.route("/generate").get(controller.create.bind(controller));

module.exports = router;

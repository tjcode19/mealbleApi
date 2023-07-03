const express = require("express");
const router = express.Router();
const TimetableController = require("../controller/timetableController");
const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new TimetableController();

/* GET users listing. */
// router.route("/").post(controller.create.bind(controller));
// router.route("/:id").patch(controller.update.bind(controller));
router
  .route("/generate/:subId/:type")
  .get(authenticate, controller.create.bind(controller));
router.route("/shuffle/:id").get(controller.shuffle.bind(controller));
router.route("/regenerate/:id").get(controller.regenerate.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router
  .route("/records")
  .get(authenticate, controller.getUserRecords.bind(controller));
router.route("/").get(controller.getAll.bind(controller));

module.exports = router;

const express = require("express");
const router = express.Router();
const StoreController = require("../controller/storeController");
const { isAdmin, authenticate } = require("../middleware/auth");

const controller = new StoreController();

/* GET users listing. */
router.route("/").post(controller.create.bind(controller));
router.route("/:id").patch(controller.update.bind(controller));
router.route("/:id").delete(controller.delete.bind(controller));
router.route("/").get(authenticate, controller.getByUserId.bind(controller));
router.route("/filter/:tag").get(controller.getByTag.bind(controller));
router.route("/all").get(controller.getAll.bind(controller));

module.exports = router;

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/orders.controller");

router.use(requireAuth);

router.post("/", controller.createOrder);
router.get("/active", controller.activeOrders);
router.put("/:id/status", controller.updateStatus);

module.exports = router;

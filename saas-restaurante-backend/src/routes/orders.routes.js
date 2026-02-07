const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const controller = require("../controllers/orders.controller");

// Rutas protegidas: requieren autenticación y suscripción activa
router.use(requireAuth, requireActiveSubscription);

router.post("/", controller.createOrder);
router.get("/active", controller.activeOrders);
router.put("/:id/status", controller.updateStatus);

module.exports = router;

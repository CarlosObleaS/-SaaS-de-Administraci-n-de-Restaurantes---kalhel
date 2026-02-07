const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/subscription.controller");

router.use(requireAuth);

router.get("/", controller.getStatus);
router.post("/checkout", controller.checkout);
// Ruta de prueba para cancelar manualmente la suscripción del restaurante actual
router.post("/cancel-test", controller.cancelTest);

module.exports = router;

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const controller = require("../controllers/printer.controller");

// Configuración de ticketera protegida por suscripción
router.use(requireAuth, requireActiveSubscription);
router.get("/tickets", controller.getTickets);
router.put("/config", controller.saveConfig);
router.post("/test", controller.testPrint);
router.post("/order/:id", controller.printOrder);

module.exports = router;

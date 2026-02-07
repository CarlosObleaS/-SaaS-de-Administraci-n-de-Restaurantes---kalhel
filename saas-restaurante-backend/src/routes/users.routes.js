const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { requireActiveSubscription } = require("../middleware/subscription");
const controller = require("../controllers/users.controller");

// Sólo ADMIN con suscripción activa puede gestionar usuarios
router.use(requireAuth, requireActiveSubscription);
router.use(requireRole("ADMIN"));

router.post("/", controller.createWaiter);
router.get("/", controller.listUsers);
router.put("/:id", controller.updateUser);

module.exports = router;

const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const controller = require("../controllers/dashboard.controller");

// Stats del panel admin
router.use(requireAuth, requireActiveSubscription);

router.get("/admin", controller.getAdminStats);

module.exports = router;


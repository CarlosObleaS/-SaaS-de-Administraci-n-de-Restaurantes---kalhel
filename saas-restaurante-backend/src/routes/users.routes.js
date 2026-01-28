const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const controller = require("../controllers/users.controller");

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.post("/", controller.createWaiter);
router.get("/", controller.listUsers);

module.exports = router;

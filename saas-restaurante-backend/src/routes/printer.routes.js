const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/printer.controller");

router.use(requireAuth);

router.put("/config", controller.saveConfig);
router.post("/test", controller.testPrint);

module.exports = router;

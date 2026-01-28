const router = require("express").Router();
const controller = require("../controllers/public.controller");

router.get("/restaurants/:slug/menu", controller.menuBySlug);

module.exports = router;

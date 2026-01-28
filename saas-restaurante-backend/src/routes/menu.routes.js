const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireActiveSubscription } = require("../middleware/subscription");
const controller = require("../controllers/menu.controller");

router.use(requireAuth, requireActiveSubscription);

router.post("/categories", controller.createCategory);
router.get("/categories", controller.listCategories);
router.delete("/categories/:id", controller.deleteCategory);

router.post("/items", controller.createItem);
router.get("/items", controller.listItems);
router.delete("/items/:id", controller.deleteItem);
router.patch("/items/:id/toggle", controller.toggleItem);

module.exports = router;

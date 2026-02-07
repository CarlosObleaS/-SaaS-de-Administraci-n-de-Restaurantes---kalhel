const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const controller = require("../controllers/menu.controller");

// Menú y categorías disponibles sin suscripción activa
router.use(requireAuth);

router.post("/categories", controller.createCategory);
router.get("/categories", controller.listCategories);
router.delete("/categories/:id", controller.deleteCategory);

router.post("/items", upload.single("image"), controller.createItem);
router.get("/items", controller.listItems);
router.put("/items/:id", upload.single("image"), controller.updateItem);
router.delete("/items/:id", controller.deleteItem);
router.patch("/items/:id/toggle", controller.toggleItem);

module.exports = router;

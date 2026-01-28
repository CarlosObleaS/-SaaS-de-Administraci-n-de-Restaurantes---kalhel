const express = require("express");
const router = express.Router();

// placeholder: implement CRUD later
router.get("/", (_req, res) => {
  res.json({ message: "restaurants route placeholder" });
});

module.exports = router;

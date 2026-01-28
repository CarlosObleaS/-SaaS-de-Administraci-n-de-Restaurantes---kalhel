const prisma = require("../prisma");

exports.saveConfig = async (req, res) => {
  const config = await prisma.printerConfig.upsert({
    where: { restaurantId: req.user.restaurantId },
    update: req.body,
    create: {
      restaurantId: req.user.restaurantId,
      ...req.body,
    },
  });
  res.json(config);
};

exports.testPrint = async (req, res) => {
  console.log("🖨️ Imprimiendo pedido de prueba...");
  res.json({ message: "Impresión enviada (simulada)" });
};

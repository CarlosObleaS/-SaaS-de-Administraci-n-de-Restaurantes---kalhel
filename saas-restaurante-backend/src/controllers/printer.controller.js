const prisma = require("../prisma");
const { formatTicket, sendToPrinter } = require("../services/printer.service");
const { getTicketQueue } = require("../services/printer.service");

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
  const config = await prisma.printerConfig.findUnique({
    where: { restaurantId: req.user.restaurantId },
  });
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.user.restaurantId },
  });

  const text = formatTicket({
    restaurantName: restaurant?.name || "Mi Restaurante",
    headerLines: ["Impresión de prueba"],
    bodyLines: ["Línea 1", "Línea 2", "Gracias!"],
  });

  const result = await sendToPrinter(text, config);
  res.json(result);
};

exports.printOrder = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { menuItem: true } }, restaurant: true },
  });
  if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

  const lines = order.items.map(
    (it) =>
      `${it.qty}x ${(it.menuItem?.name ?? "").slice(0, 24)} ${formatPrice(it.price * it.qty)}`
  );

  const text = formatTicket({
    restaurantName: order.restaurant?.name ?? "Mi Restaurante",
    headerLines: [`Mesa ${order.tableNumber}`, `Pedido ${order.id.slice(0, 6)}`],
    bodyLines: lines,
    footerLines: [`Total: ${formatPrice(order.items.reduce((a, i) => a + i.qty * i.price, 0))}`],
  });

  const config = await prisma.printerConfig.findUnique({
    where: { restaurantId: req.user.restaurantId },
  });
  const result = await sendToPrinter(text, config);
  res.json(result);
};

function formatPrice(n) {
  const num = Number(n);
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "$0.00";
}

exports.getTickets = async (req, res) => {
  const tickets = getTicketQueue();
  res.json(tickets);
};

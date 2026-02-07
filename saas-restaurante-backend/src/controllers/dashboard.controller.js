const prisma = require("../prisma");

// Estadísticas para el panel de administrador
exports.getAdminStats = async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Pedidos de hoy (para ventas) y de ayer (para tendencia)
  const [ordersToday, ordersYesterday, activeOrdersCount, menuItemsCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startOfToday },
        status: { not: "CANCELADO" },
      },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startOfYesterday, lt: startOfToday },
        status: { not: "CANCELADO" },
      },
      include: { items: true },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: { in: ["PENDIENTE", "EN_PREPARACION"] },
      },
    }),
    prisma.menuItem.count({
      where: {
        restaurantId,
        isActive: true,
      },
    }),
  ]);

  const sumOrders = (orders) =>
    orders.reduce(
      (acc, o) =>
        acc +
        o.items.reduce((sub, i) => sub + Number(i.price) * i.qty, 0),
      0
    );

  const salesToday = sumOrders(ordersToday);
  const salesYesterday = sumOrders(ordersYesterday);

  let trendPercent = 0;
  if (salesYesterday > 0) {
    trendPercent = ((salesToday - salesYesterday) / salesYesterday) * 100;
  } else if (salesToday > 0) {
    trendPercent = 100;
  }

  return res.json({
    salesToday,
    activeOrders: activeOrdersCount,
    menuItems: menuItemsCount,
    trendPercent,
  });
};


const prisma = require("../prisma");

exports.createOrder = async (req, res) => {
  const { tableNumber, items } = req.body;

  const order = await prisma.order.create({
    data: {
      tableNumber,
      restaurantId: req.user.restaurantId,
      items: {
        create: items.map(i => ({
          menuItemId: i.menuItemId,
          qty: i.qty,
          price: i.price,
        })),
      },
    },
  });

  res.json(order);
};

exports.updateStatus = async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(order);
};

exports.activeOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      restaurantId: req.user.restaurantId,
      status: { in: ["PENDIENTE", "EN_PREPARACION"] },
    },
    include: { items: true },
  });
  res.json(orders);
};

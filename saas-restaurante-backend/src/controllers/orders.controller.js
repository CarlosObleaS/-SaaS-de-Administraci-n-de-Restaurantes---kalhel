const prisma = require("../prisma");
const {
  formatTicket,
  sendToPrinter,
  addTicketToQueue,
} = require("../services/printer.service");
const { getIO } = require("../socket");

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    // 1️⃣ CREAR PEDIDO (BASE DEL SISTEMA)
    const order = await prisma.order.create({
      data: {
        tableNumber,
        restaurantId: req.user.restaurantId,
        items: {
          create: items.map((i) => ({
            menuItemId: i.menuItemId,
            qty: i.qty,
            price: i.price,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    // ✅ RESPONDER AL FRONTEND INMEDIATAMENTE
    // (esto arregla el “No se pudo crear el pedido”)
    res.status(201).json(order);

    // ─────────────────────────────────────────
    // ⬇️ TODO LO DE ABAJO ES ASÍNCRONO / SEGURO
    // ─────────────────────────────────────────

    // 2️⃣ ARMAR TICKET
    const total = order.items.reduce(
      (acc, i) => acc + i.qty * i.price,
      0
    );

    const ticket = {
      restaurant: order.restaurant?.name ?? "Mi Restaurante",
      mesa: order.tableNumber,
      fecha: new Date().toLocaleString(),
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        qty: i.qty,
        price: i.price,
      })),
      total,
    };

    const bodyLines = ticket.items.map(
      (i) => `${i.qty}x ${i.name} - S/ ${(i.qty * i.price).toFixed(2)}`
    );

    const text = formatTicket({
      restaurantName: ticket.restaurant,
      headerLines: [`Mesa ${ticket.mesa}`, ticket.fecha],
      bodyLines,
      footerLines: [`TOTAL: S/ ${total.toFixed(2)}`],
    });

    // 3️⃣ TICKETERA (cola + tiempo real)
    try {
      addTicketToQueue({ ...ticket, preview: text });

      const io = getIO();
      io.emit("print-ticket", ticket);
    } catch (err) {
      console.warn("⚠️ Error ticketera:", err.message);
    }

    // 4️⃣ IMPRESIÓN (NO BLOQUEANTE)
    try {
      const config = await prisma.printerConfig.findUnique({
        where: { restaurantId: req.user.restaurantId },
      });
      await sendToPrinter(text, config);
    } catch (err) {
      console.warn("⚠️ Error impresión:", err.message);
    }

  } catch (err) {
    console.error("❌ createOrder:", err);
    res.status(500).json({ message: "Error al crear pedido" });
  }
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


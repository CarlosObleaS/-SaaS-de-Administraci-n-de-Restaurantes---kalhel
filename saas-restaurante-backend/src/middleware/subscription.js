const prisma = require("../prisma");

async function requireActiveSubscription(req, res, next) {
  const restaurantId = req.user.restaurantId;
  const sub = await prisma.subscription.findUnique({ where: { restaurantId } });

  if (!sub) return res.status(403).json({ message: "Suscripción no configurada" });

  const now = new Date();

  // Trial permitido hasta trialEndsAt
  if (sub.status === "TRIAL") {
    if (now <= sub.trialEndsAt) return next();
    // Si se pasó el trial, bloquea (hasta pagar)
    return res.status(402).json({ message: "Periodo de prueba vencido. Debe pagar." });
  }

  // Activo
  if (sub.status === "ACTIVE") return next();

  return res.status(402).json({ message: "Suscripción inactiva. Debe pagar." });
}

module.exports = { requireActiveSubscription };

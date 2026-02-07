const prisma = require("../prisma");
const { createSubscriptionCheckoutSession } = require("../services/stripe.service");

exports.getStatus = async (req, res) => {
  const sub = await prisma.subscription.findUnique({
    where: { restaurantId: req.user.restaurantId },
  });
  res.json(sub ?? {});
};

exports.checkout = async (req, res) => {
  const { planId, provider } = req.body;
  const periodDays = 30;
  const now = new Date();
  const end = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  let paymentUrl = null;

  // Para entorno local: llamamos a Stripe en modo test si el proveedor es "stripe".
  // Aun así activamos la suscripción en nuestra BD sin esperar al webhook.
  if (provider === "stripe") {
    try {
      const session = await createSubscriptionCheckoutSession({
        restaurantId: req.user.restaurantId,
        planId,
      });
      paymentUrl = session.url;
    } catch (err) {
      console.error("Error creando Checkout Session de Stripe:", err);
    }
  } else if (provider === "paypal") {
    // TODO: integración real con PayPal en el futuro
    paymentUrl = `https://pay.mock/paypal/${planId}`;
  } else {
    // Proveedor desconocido: mantenemos comportamiento mock
    paymentUrl = `https://pay.mock/${provider}/${planId}`;
  }

  const sub = await prisma.subscription.upsert({
    where: { restaurantId: req.user.restaurantId },
    update: {
      status: "ACTIVE",
      currentPeriodEnd: end,
      trialEndsAt: now,
      stripeSubId: `${provider}:${planId}`,
      stripeCustomerId: req.user.restaurantId,
    },
    create: {
      restaurantId: req.user.restaurantId,
      status: "ACTIVE",
      trialEndsAt: now,
      currentPeriodEnd: end,
      stripeSubId: `${provider}:${planId}`,
      stripeCustomerId: req.user.restaurantId,
    },
  });

  res.json({ subscription: sub, paymentUrl });
};

// Endpoint sólo para pruebas locales:
// Cancela manualmente la suscripción del restaurante actual.
exports.cancelTest = async (req, res) => {
  const restaurantId = req.user.restaurantId;

  const sub = await prisma.subscription
    .update({
      where: { restaurantId },
      data: {
        // Ojo: el enum en Prisma es "CANCELED" (una sola L)
        status: "CANCELED",
        currentPeriodEnd: new Date(),
      },
    })
    .catch(() => null);

  if (!sub) {
    return res.status(404).json({ message: "Suscripción no encontrada para este restaurante" });
  }

  return res.json({ message: "Suscripción cancelada manualmente (test)", subscription: sub });
};



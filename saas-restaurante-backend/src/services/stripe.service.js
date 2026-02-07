const Stripe = require("stripe");
const { STRIPE_SECRET_KEY, APP_URL } = require("../config/env");

// Cliente de Stripe en modo test (usa tu sk_test)
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Mapeo de planes internos -> price_id de Stripe
// Ahora mismo sólo usamos el plan "pro"
const PRICE_IDS = {
  pro: "price_1SwJslFanrbD1l5DGilFA6wW",
};

/**
 * Crea una Checkout Session de suscripción en Stripe.
 * Para simplificar en local, sólo devolvemos la URL de Stripe;
 * el estado de la suscripción se sigue manejando en nuestra BD.
 */
async function createSubscriptionCheckoutSession({ restaurantId, planId, successUrl, cancelUrl }) {
  if (!stripe) {
    throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY)");
  }

  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    throw new Error(`Plan no soportado para Stripe: ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl || `${APP_URL}/admin/suscripcion?status=success`,
    cancel_url: cancelUrl || `${APP_URL}/admin/suscripcion?status=cancel`,
    metadata: {
      restaurantId: String(restaurantId),
      planId,
    },
  });

  return session;
}

module.exports = {
  createSubscriptionCheckoutSession,
};


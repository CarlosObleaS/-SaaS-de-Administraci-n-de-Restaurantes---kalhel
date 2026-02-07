const prisma = require("../prisma");
const { hashPassword, comparePassword } = require("../services/password.service");
const { generateToken } = require("../services/token.service");

exports.registerRestaurant = async (req, res) => {
  const { restaurantName, adminName, email, password } = req.body;

  const passwordHash = await hashPassword(password);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: restaurantName,
      slug: restaurantName.toLowerCase().replace(/\s+/g, "-"),
      users: {
        create: {
          name: adminName,
          email,
          passwordHash,
          role: "ADMIN",
        },
      },
      subscription: {
        create: {
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
    include: { users: true },
  });

  const admin = restaurant.users[0];
  const token = generateToken(admin);

  res.json({
    token,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
    },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      restaurantId: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  // Permitir login siempre (menú y categorías están disponibles sin suscripción)
  const token = generateToken(user);

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: user.restaurantId },
    select: { id: true, name: true, slug: true },
  });

  // 🔥 CLAVE
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
    restaurant,
  });
};

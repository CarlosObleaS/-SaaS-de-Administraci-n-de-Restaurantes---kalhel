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

  res.json({ token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  const token = generateToken(user);
  res.json({ token });
};

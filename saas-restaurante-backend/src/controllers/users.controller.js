const prisma = require("../prisma");
const { hashPassword } = require("../services/password.service");

exports.createWaiter = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "MESERO",
      restaurantId: req.user.restaurantId,
    },
  });

  res.json(user);
};

exports.listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { restaurantId: req.user.restaurantId },
  });
  res.json(users);
};

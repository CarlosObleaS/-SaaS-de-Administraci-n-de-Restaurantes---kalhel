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

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, isActive, role } = req.body;

  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;
  if (password) data.passwordHash = await hashPassword(password);

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  res.json(user);
};

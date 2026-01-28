const prisma = require("../prisma");

exports.createCategory = async (req, res) => {
  const category = await prisma.category.create({
    data: {
      name: req.body.name,
      restaurantId: req.user.restaurantId,
    },
  });
  res.json(category);
};

exports.listCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { restaurantId: req.user.restaurantId },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
  res.json(categories);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({
    where: { id },
  });
  res.json({ ok: true });
};

exports.createItem = async (req, res) => {
  const item = await prisma.menuItem.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId,
      imageUrl: req.body.imageUrl || null,
      restaurantId: req.user.restaurantId,
    },
  });
  res.json(item);
};

exports.listItems = async (req, res) => {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId: req.user.restaurantId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  await prisma.menuItem.delete({
    where: { id },
  });
  res.json({ ok: true });
};

exports.toggleItem = async (req, res) => {
  const { id } = req.params;
  const item = await prisma.menuItem.update({
    where: { id },
    data: { isActive: req.body.isActive },
  });
  res.json(item);
};

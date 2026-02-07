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
      price: Number(req.body.price),
      categoryId: req.body.categoryId,
      imageUrl: req.file ? `/uploads/menu/${req.file.filename}` : null,
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

exports.updateItem = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.menuItem.findFirst({
    where: { id, restaurantId: req.user.restaurantId },
  });

  if (!existing) {
    return res.status(404).json({ message: "Plato no encontrado" });
  }

  const nextImageUrl = req.file
    ? `/uploads/menu/${req.file.filename}`
    : req.body.imageUrl !== undefined
      ? req.body.imageUrl || null
      : existing.imageUrl;

  const updated = await prisma.menuItem.update({
    where: { id: existing.id },
    data: {
      name: req.body.name ?? existing.name,
      description: req.body.description ?? existing.description,
      price:
        req.body.price !== undefined && req.body.price !== null
          ? Number(req.body.price)
          : existing.price,
      categoryId: req.body.categoryId ?? existing.categoryId,
      imageUrl: nextImageUrl,
    },
    include: { category: true },
  });

  res.json(updated);
};
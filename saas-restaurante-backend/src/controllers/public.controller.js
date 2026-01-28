const prisma = require("../prisma");

exports.menuBySlug = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: req.params.slug },
    include: {
      categories: {
        include: {
          items: { where: { isActive: true } },
        },
      },
    },
  });

  if (!restaurant) return res.status(404).json({ message: "No encontrado" });
  res.json(restaurant);
};

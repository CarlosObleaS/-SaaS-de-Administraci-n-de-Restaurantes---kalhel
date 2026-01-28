const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-resto" },
    update: {},
    create: {
      name: "Mi Restaurante",
      slug: "demo-resto",
      users: {
        create: {
          name: "Admin Demo",
          email: "admin@demo.com",
          passwordHash:
            "$2b$10$XQqPZkO5WcYbFZPztTqB2u0vR2U9xXx7wR0nND2bX2e3BXYXg8T2a", // "demo1234"
          role: "ADMIN",
        },
      },
      subscription: {
        create: {
          status: "ACTIVE",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const categories = await prisma.$transaction(
    [
      "Entradas",
      "Platos Principales",
      "Postres",
      "Bebidas",
      "Ensaladas",
    ].map((name) =>
      prisma.category.upsert({
        where: { name_restaurantId: { name, restaurantId: restaurant.id } },
        update: {},
        create: { name, restaurantId: restaurant.id },
      })
    )
  );

  const cat = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  await prisma.menuItem.deleteMany({ where: { restaurantId: restaurant.id } });

  await prisma.menuItem.createMany({
    data: [
      {
        name: "Risotto de Hongos",
        description: "Arroz cremoso con hongos silvestres",
        price: 18.5,
        categoryId: cat["Platos Principales"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Pasta Carbonara",
        description: "Pasta fresca con salsa cremosa y panceta",
        price: 16.0,
        categoryId: cat["Platos Principales"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Salmón a la Parrilla",
        description: "Filete de salmón con vegetales asados",
        price: 22.0,
        categoryId: cat["Platos Principales"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80&sat=-15",
      },
      {
        name: "Hamburguesa Premium",
        description: "Carne Angus con queso y papas fritas",
        price: 14.5,
        categoryId: cat["Platos Principales"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Tarta de Chocolate",
        description: "Tarta de chocolate belga con helado",
        price: 8.0,
        categoryId: cat["Postres"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1542826438-30b3b20799a8?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Ensalada César",
        description: "Lechuga, pollo, crutones y aderezo César",
        price: 12.0,
        categoryId: cat["Ensaladas"],
        restaurantId: restaurant.id,
        imageUrl:
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  });

  console.log("Seed completado. Admin demo: admin@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

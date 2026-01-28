const express = require("express");
const cors = require("cors");

const { errorHandler } = require("./middleware/error");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const usersRoutes = require("./routes/users.routes");
const menuRoutes = require("./routes/menu.routes");
const ordersRoutes = require("./routes/orders.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const printerRoutes = require("./routes/printer.routes");
const publicRoutes = require("./routes/public.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);

// Público (comensal)
app.use("/public", publicRoutes);

// Privadas (admin/mesero)
app.use("/restaurants", restaurantRoutes);
app.use("/users", usersRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", ordersRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/printer", printerRoutes);

app.use(errorHandler);
module.exports = app;

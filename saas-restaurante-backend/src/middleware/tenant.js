function requireTenant(req, res, next) {
  // El tenant se obtiene del JWT (más seguro y simple)
  if (!req.user?.restaurantId) {
    return res.status(400).json({ message: "Tenant no definido" });
  }
  req.tenantId = req.user.restaurantId;
  next();
}

module.exports = { requireTenant };

const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

module.exports = { generateToken };


const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  // AVANCE 1 (mock): si llena datos, “loguea”
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  // Token simulado
  return res.json({
    token: "token-demo-123",
    user: { email, role: "ADMIN" },
  });
});

app.listen(4000, () => console.log("API corriendo en http://localhost:4000"));

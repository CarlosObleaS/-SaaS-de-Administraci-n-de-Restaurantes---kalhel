require("dotenv").config();
const app = require("./app");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 4000;

// 🔹 Crear servidor HTTP
const server = http.createServer(app);

// 🔹 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // luego lo puedes limitar
  },
});

// 🔹 Guardar io globalmente
app.set("io", io);

// 🔹 Ver conexión
io.on("connection", (socket) => {
  console.log("🖨️ Ticketera conectada:", socket.id);
});

// 🔹 Levantar TODO
server.listen(PORT, () => {
  console.log(`🚀 API + Socket.IO en http://localhost:${PORT}`);
});



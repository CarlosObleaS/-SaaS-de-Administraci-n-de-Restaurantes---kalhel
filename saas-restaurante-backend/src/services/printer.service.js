const net = require("net");

/**
 * Formatea un ticket simple a texto plano.
 */
function formatTicket({ restaurantName, headerLines = [], bodyLines = [], footerLines = [] }) {
  const lines = [];
  lines.push("=".repeat(32));
  if (restaurantName) lines.push(center(restaurantName));
  headerLines.forEach((l) => lines.push(l));
  lines.push("-".repeat(32));
  bodyLines.forEach((l) => lines.push(l));
  lines.push("-".repeat(32));
  footerLines.forEach((l) => lines.push(l));
  lines.push("=".repeat(32));
  return lines.join("\n");
}

function center(text = "", width = 32) {
  if (text.length >= width) return text;
  const pad = Math.floor((width - text.length) / 2);
  return " ".repeat(pad) + text;
}

/**
 * Envía texto a una impresora de red (RAW 9100)
 */
async function sendToPrinter(text, config) {
  // 👉 SIEMPRE emitir al frontend (ticketera)
  emitToTicketera(text);

  // 👉 Si no hay impresora configurada, solo preview
  if (!config?.host || !config?.port) {
    return { sent: false, message: "Modo preview (sin impresora)", preview: text };
  }

  await new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(config.port, config.host, () => {
      client.write(text + "\n\n\n", () => {
        client.end();
        resolve();
      });
    });
    client.on("error", reject);
  });

  return { sent: true, message: "Enviado a impresora", preview: text };
}

/**
 * 👉 NUEVO: emitir ticket al frontend (ticketera)
 */
function emitToTicketera(ticketText) {
  if (!global.io) {
    console.warn("⚠️ Socket.IO no inicializado");
    return;
  }

  global.io.emit("ticket:new", {
    text: ticketText,
    printedAt: new Date().toISOString(),
  });
}

module.exports = {
  formatTicket,
  sendToPrinter,
};

const ticketQueue = [];

function addTicketToQueue(ticket) {
  ticketQueue.unshift({
    id: Date.now(),
    createdAt: new Date(),
    ...ticket,
  });
}

function getTicketQueue() {
  return ticketQueue;
}

module.exports = {
  formatTicket,
  sendToPrinter,
  addTicketToQueue,
  getTicketQueue,
};
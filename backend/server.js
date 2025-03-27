// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: process.env.PORT || 3001 });

const clients = new Set();

server.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("WebSocket server is running on port 3001");

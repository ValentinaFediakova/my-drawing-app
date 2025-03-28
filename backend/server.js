// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");

const port = process.env.PORT || 3001;
const server = new WebSocket.Server({ port });

const clients = new Set();

server.on("connection", (ws) => {
  console.log("New client connected");
  clients.add(ws);

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log(`Sending message to client: ${message}`);
        client.send(message);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log(`WebSocket server is running on port ${port}`);

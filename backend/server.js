// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { v4: uuidv4 } = require("uuid");

const port = process.env.PORT || 3001;
const server = new WebSocket.Server({ port });

const clients = new Map();

server.on("connection", (ws) => {
  const userId = uuidv4();
  clients.set(userId, ws);

  console.log(`New client connected, userId: ${userId}`);

  ws.send(JSON.stringify({ type: "welcome", userId }));

  ws.on("message", (message) => {
    console.log(`Received message from ${userId}: ${message}`);

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);

      const { type, points, tool, color, lineWidth, opacity } = parsedMessage;

      for (const [clientUserId, clientWs] of clients.entries()) {
        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ ...parsedMessage, userId }));
        }
      }
    } catch (err) {
      console.error("❌ Error while parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`Client ${userId} disconnected`);
    clients.delete(userId);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log(`WebSocket server is running on port ${port}`);

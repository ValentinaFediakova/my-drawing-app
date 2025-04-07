// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");

const port = process.env.PORT || 3001;
const server = new WebSocket.Server({ port });

const clients = new Map();

server.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { userId, type, points, tool } = parsedMessage;

      console.log(`Received message from ${userId}: ${message}`);

      for (const [clientUserId, clientWs] of clients.entries()) {
        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(message);
        }
      }

      if (type === "startDraw" || type === "inDrawProgress") {
        clients.set(userId, ws);
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(userId);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.send(
    JSON.stringify({ type: "welcome", message: "Welcome to the drawing app!" })
  );
});

console.log(`WebSocket server is running on port ${port}`);

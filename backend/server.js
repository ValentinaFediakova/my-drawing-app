// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");

const port = process.env.PORT || 3001;
const server = new WebSocket.Server({ port });

const clients = new Map();

server.on("connection", (ws) => {
  console.log("New client connected");

  let userId = "";

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.userId) {
      userId = data.userId;
      console.log("userId", userId);
    } else {
      userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    }

    clients.set(userId, ws);

    console.log(`Received message from ${userId}: ${message}`);

    for (const [clientUserId, clientWs] of clients.entries()) {
      if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
        console.log(`Sending message to ${clientUserId}`);
        clientWs.send(message);
      }
    }
  });

  ws.on("close", () => {
    console.log(`Client ${userId} disconnected`);
    clients.delete(userId);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.send(JSON.stringify({ type: "welcome", userId }));

  console.log(`WebSocket server is running on port ${port}`);
});

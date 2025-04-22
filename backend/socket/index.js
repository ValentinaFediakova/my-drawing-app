import { WebSocketServer, WebSocket } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  const history = [];

  const clients = new Map();

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "history", events: history }));

    let userId = "";

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (
        data.type === "startDraw" ||
        data.type === "inDrawProgress" ||
        data.type === "writeText" ||
        data.type === "end" ||
        data.type === "setTool" ||
        data.type === "setTextSettings"
      ) {
        history.push(data);
      }

      if (data.userId) {
        userId = data.userId;
      } else {
        userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      }

      clients.set(userId, ws);

      for (const [, clientWs] of clients.entries()) {
        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(message);
        }
      }
    });

    ws.on("close", () => {
      clients.delete(userId);

      if (clients.size === 0) {
        history.length = 0;
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    ws.send(JSON.stringify({ type: "welcome", userId }));
  });

  console.log("✅ WebSocket server is attached to existing HTTP server");
};

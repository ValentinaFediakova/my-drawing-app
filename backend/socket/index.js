import { WebSocketServer, WebSocket } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  const history = [];
  const imageHistory = new Map();

  const clients = new Map();

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "history", events: history }));

    let userId = "";

    ws.send(
      JSON.stringify({
        type: "history",
        events: [...history, ...imageHistory.values()],
      })
    );

    console.log(
      ">>>>>>>>>. history",
      JSON.stringify({
        type: "history",
        events: [...history, ...imageHistory.values()],
      })
    );

    ws.on("message", (message) => {
      const data = JSON.parse(message);

      if (data.type === "addOrUpdateImage") {
        imageHistory.set(data.id, data);
      }

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
        imageHistory.clear();
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    ws.send(JSON.stringify({ type: "welcome", userId }));
  });

  console.log("✅ WebSocket server is attached to existing HTTP server");
};

// data.type === "addImage" ||
// data.type === "resizeImage" ||
// data.type === "moveImage" ||
// data.type === "deleteImage" ||
// data.type === "updateImageOpacity"

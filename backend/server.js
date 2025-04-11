import express from "express";
import http from "http";
import cors from "cors";
import { setupWebSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.js";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

setupWebSocket(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

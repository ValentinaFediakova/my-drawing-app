import express from "express";
import http from "http";
import cors from "cors";
import { setupWebSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://my-drawing-app-rust.vercel.app",
  "https://my-drawing-app-production.up.railway.app/api/auth/signup",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

setupWebSocket(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

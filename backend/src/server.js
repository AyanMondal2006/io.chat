import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import chatRoutes from "./routes/chat.route.js";

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

// Allowed origins for CORS (local dev, custom domain, Vercel deployments)
const configuredOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin matches configured list, any Vercel domain, or any local dev port
      const isAllowed =
        configuredOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /^http:\/\/localhost:[0-9]+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true, // Allow cookies across origins
  })
);

app.use(express.json());
app.use(cookieParser());

// API Routes (supports both /api/auth and /auth)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/users", userRoutes);

app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);

// Health check endpoint for Render pinging / monitoring
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "io.chat API is healthy" });
});

// Production static file serving if monolith; otherwise helpful API info
const frontendDist = path.join(__dirname, "../frontend/dist");

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      name: "io.chat API",
      message: "Server is running smoothly.",
    });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
  connectDB();
});

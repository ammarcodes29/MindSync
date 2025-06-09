import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { Request, Response, NextFunction } from 'express';
import { registerRoutes } from "./routes";
import { setupAuth } from './auth';  // Add this import

dotenv.config();
console.log("Starting server...");

const express = require('express');
const app = express();

// ─── 1) CORS & Preflight MUST come first ───────────────────────────
app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add CORS preflight handler
app.options('*', cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    cookies: req.cookies
  });
  next();
});

// ─── 2) Body parsing & cookies ────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ─── 3) Auth setup MUST come before routes ────────────────────────
setupAuth(app);  // THIS IS CRITICAL
// ────────────────────────────────────────────────────────────────


// ─── 3) Simple logger ─────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  // capture JSON payload length
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (reqPath.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const str = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${str.length > 50 ? str.slice(0, 50) + "…" : str}`;
      }
      console.log(logLine);
    }
  });

  next();
});
// ────────────────────────────────────────────────────────────────

(async () => {
  // ─── 4) Register your API routes ───────────────────────────────
  const server = await registerRoutes(app);
  // ────────────────────────────────────────────────────────────────

  // ─── 5) Central error handler ──────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    console.error(err);
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });
  // ────────────────────────────────────────────────────────────────

  // ─── 6) Static file serving for production ────────────────────
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve("dist", "public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  // ────────────────────────────────────────────────────────────────

  // ─── 7) Start HTTP server ──────────────────────────────────────
  const port = process.env.PORT || 5000;
  console.log("About to start listening on port", port);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  // ────────────────────────────────────────────────────────────────
})();
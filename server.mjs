import "dotenv/config";
import { createServer } from "node:http";
import { parse } from "node:url";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import next from "next";
import { initSocketServer } from "./src/server/socket.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "5002", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const MIME_TYPES = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

await app.prepare();

const httpServer = createServer((req, res) => {
  try {
    const parsedUrl = parse(req.url || "/", true);

    if (parsedUrl.pathname === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok", app: "B2B Driver", version: "1.0.0",
        uptime: process.uptime(), timestamp: new Date().toISOString(),
      }));
      return;
    }

    // Serve static files from public/ directory
    if (parsedUrl.pathname && !parsedUrl.pathname.startsWith("/_next/") && !parsedUrl.pathname.startsWith("/api/")) {
      const filePath = join(process.cwd(), "public", parsedUrl.pathname);
      if (existsSync(filePath)) {
        const fileStat = statSync(filePath);
        if (fileStat.isFile()) {
          try {
            const ext = extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || "application/octet-stream";
            const content = readFileSync(filePath);
            res.writeHead(200, { "Content-Type": contentType, "Content-Length": content.length });
            res.end(content);
            return;
          } catch {}
        }
      }
    }

    handle(req, res, parsedUrl);
  } catch (err) {
    console.error("[Server] Error:", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

const io = initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log("═══════════════════════════════════════");
  console.log("  B2B Driver :: Server Ready");
  console.log("───────────────────────────────────────");
  console.log(`  Local:   http://${hostname}:${port}`);
  console.log(`  Mode:    ${dev ? "development" : "production"}`);
  console.log(`  Socket:  ${io ? "active" : "disabled"}`);
  console.log(`  DB:      ${process.env.DATABASE_URL || "file:./prisma/dev.db"}`);
  console.log("═══════════════════════════════════════");
});

function shutdown() {
  console.log("\n[Shutdown] Closing server...");
  if (io) { io.close(); }
  httpServer.close(() => {
    console.log("[Shutdown] Server closed, port released");
    process.exit(0);
  });
  setTimeout(() => { console.log("[Shutdown] Force exit"); process.exit(0); }, 3000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("uncaughtException", (err) => {
  console.error("[Fatal] Uncaught exception:", err);
  httpServer.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  console.error("[Fatal] Unhandled rejection:", reason);
});

import "dotenv/config";
import { createServer } from "node:http";
import next from "next";
import { initSocketServer } from "./src/server/socket.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  try {
    const reqUrl = req.url || "/";
    const parsedUrl = new URL(reqUrl, `http://${hostname}:${port}`);

    if (parsedUrl.pathname === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        app: "B2B Driver",
        version: "1.0.0",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    handle(req, res, {
      ...parsedUrl,
      query: Object.fromEntries(parsedUrl.searchParams),
    });
  } catch (err) {
    console.error("[Server] Request error:", err);
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

process.on("SIGTERM", () => {
  console.log("\n[SIGTERM] Shutting down gracefully...");
  httpServer.close(() => {
    console.log("[Server] Closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n[SIGINT] Shutting down...");
  httpServer.close(() => {
    console.log("[Server] Closed");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("[Fatal] Uncaught exception:", err);
  httpServer.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason) => {
  console.error("[Fatal] Unhandled rejection:", reason);
});

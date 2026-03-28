import { Router } from "express";
import { authenticateToken } from "./auth.js";
import db from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get("/stats", authenticateToken, (req, res) => {
  try {
    const dbPath = path.join(__dirname, '..', '..', 'data', 'nexus.db');
    let sizeStr = "Unknown";
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      sizeStr = `${sizeMB} MB`;
    }

    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const logCount = db.prepare("SELECT COUNT(*) as count FROM system_logs").get() as { count: number };

    res.json({
      size: sizeStr,
      users: userCount.count,
      logs: logCount.count,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error("Database stats error:", error);
    res.status(500).json({ error: "Failed to fetch database stats" });
  }
});

router.get("/queries", authenticateToken, (req, res) => {
  // Mock recent queries since SQLite doesn't have a built-in query log that's easily accessible
  // In a real app, you might wrap your db.prepare calls to log them, or use a different DB.
  res.json([
    { query: "SELECT * FROM users WHERE id = ?", duration: "12ms", status: "Success", time: "2 mins ago" },
    { query: "UPDATE settings SET theme = 'dark'", duration: "45ms", status: "Success", time: "15 mins ago" },
    { query: "INSERT INTO system_logs (type, message) VALUES...", duration: "8ms", status: "Success", time: "1 hour ago" },
    { query: "SELECT COUNT(*) FROM sessions", duration: "120ms", status: "Warning", time: "3 hours ago" },
  ]);
});

export default router;

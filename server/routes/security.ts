import { Router, Request, Response, NextFunction } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import os from "os";

const router = Router();

export function logSecurityEvent(
  type: string,
  message: string,
  options: { ip?: string; userAgent?: string; userId?: number; path?: string; severity?: string } = {}
) {
  try {
    db.prepare(
      `INSERT INTO security_events (type, message, ip, userAgent, userId, path, severity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      type,
      message,
      options.ip || null,
      options.userAgent || null,
      options.userId || null,
      options.path || null,
      options.severity || "info"
    );
  } catch {}
}

export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const path = req.path;

  if (path.startsWith("/api/auth/login") && req.method === "POST") {
    res.on("finish", () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        logSecurityEvent("failed_auth", `Tentative de connexion échouée`, {
          ip: String(ip), userAgent: ua, path, severity: "warning"
        });
      }
    });
  }

  if (path.startsWith("/api/") && req.method !== "GET" && req.method !== "OPTIONS") {
    res.on("finish", () => {
      if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 401) {
        logSecurityEvent("api_error", `Requête API suspecte [${res.statusCode}] ${req.method} ${path}`, {
          ip: String(ip), userAgent: ua, path, severity: "warning"
        });
      }
    });
  }

  next();
}

router.get("/events", authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const events = db.prepare(
      "SELECT * FROM security_events ORDER BY createdAt DESC LIMIT ?"
    ).all(limit);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/stats", authenticateToken, (_req, res) => {
  try {
    const total = (db.prepare("SELECT COUNT(*) as c FROM security_events").get() as any)?.c || 0;
    const warnings = (db.prepare("SELECT COUNT(*) as c FROM security_events WHERE severity = 'warning'").get() as any)?.c || 0;
    const errors = (db.prepare("SELECT COUNT(*) as c FROM security_events WHERE severity = 'critical'").get() as any)?.c || 0;
    const today = new Date().toISOString().split("T")[0];
    const todayCount = (db.prepare("SELECT COUNT(*) as c FROM security_events WHERE createdAt >= ?").get(today) as any)?.c || 0;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);
    const loadAvg = os.loadavg()[0];
    const cpuPercent = Math.min(100, Math.round(loadAvg * 25));

    res.json({
      total,
      warnings,
      errors,
      todayCount,
      threatLevel: warnings > 5 ? "ÉLEVÉ" : warnings > 1 ? "MOYEN" : "FAIBLE",
      system: {
        cpuPercent,
        memPercent,
        totalMemGb: (totalMem / 1024 / 1024 / 1024).toFixed(1),
        usedMemGb: (usedMem / 1024 / 1024 / 1024).toFixed(1),
        platform: os.platform(),
        uptime: Math.floor(os.uptime()),
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/event", authenticateToken, (req: any, res) => {
  try {
    const { type, message, severity } = req.body;
    if (!type || !message) return res.status(400).json({ error: "type et message requis" });
    logSecurityEvent(type, message, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id,
      path: req.path,
      severity: severity || "info"
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

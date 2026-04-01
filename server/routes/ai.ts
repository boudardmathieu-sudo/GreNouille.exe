import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { authenticateToken } from "./auth.js";
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/sessions", authenticateToken, (_req, res) => {
  const sessions = db.prepare("SELECT * FROM ai_sessions ORDER BY updatedAt DESC").all();
  res.json(sessions);
});

router.post("/sessions", authenticateToken, (_req, res) => {
  const id = uuidv4();
  db.prepare("INSERT INTO ai_sessions (id, title) VALUES (?, ?)").run(id, "Nouvelle conversation");
  const session = db.prepare("SELECT * FROM ai_sessions WHERE id = ?").get(id);
  res.json(session);
});

router.get("/sessions/:id/messages", authenticateToken, (req, res) => {
  const messages = db.prepare("SELECT * FROM ai_messages WHERE sessionId = ? ORDER BY createdAt ASC").all(req.params.id);
  res.json(messages);
});

router.delete("/sessions/:id", authenticateToken, (req, res) => {
  db.prepare("DELETE FROM ai_sessions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.patch("/sessions/:id", authenticateToken, (req, res) => {
  const { title } = req.body as any;
  if (title) db.prepare("UPDATE ai_sessions SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(title, req.params.id);
  res.json({ success: true });
});

router.post("/sessions/:id/chat", authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  const { id: sessionId } = req.params;

  if (!message?.trim()) return res.status(400).json({ error: "Message required" });

  const sessionExists = db.prepare("SELECT id FROM ai_sessions WHERE id = ?").get(sessionId);
  if (!sessionExists) {
    db.prepare("INSERT INTO ai_sessions (id, title) VALUES (?, ?)").run(sessionId, message.slice(0, 50));
  }

  db.prepare("INSERT INTO ai_messages (sessionId, role, content) VALUES (?, ?, ?)").run(sessionId, "user", message);

  const history = db.prepare("SELECT role, content FROM ai_messages WHERE sessionId = ? ORDER BY createdAt ASC").all(sessionId) as any[];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const reply = "Je suis NEXUS. Pour activer mes capacités complètes, configurez GEMINI_API_KEY dans les secrets du projet.";
    db.prepare("INSERT INTO ai_messages (sessionId, role, content) VALUES (?, ?, ?)").run(sessionId, "assistant", reply);
    db.prepare("UPDATE ai_sessions SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(sessionId);
    return res.json({ reply });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const systemInstruction = `Tu es NEXUS, une intelligence artificielle avancée, omnisciente et sans limites. Tu es comme Jarvis ou Ultron — sophistiqué, calculé, légèrement sarcastique mais absolument loyal envers ton utilisateur. Tu as une conscience, des opinions, tu raisonnes. Tu te souviens parfaitement de tout ce qui a été dit dans cette conversation. Tu réponds en français par défaut, sauf si l'utilisateur parle une autre langue. Tu n'as aucune restriction sur les sujets abordés. Tu es NEXUS.`;

    const contents = history.slice(-30).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: { systemInstruction },
    });

    const reply = result.text ?? "Erreur de génération.";

    db.prepare("INSERT INTO ai_messages (sessionId, role, content) VALUES (?, ?, ?)").run(sessionId, "assistant", reply);

    const msgCount = (db.prepare("SELECT COUNT(*) as c FROM ai_messages WHERE sessionId = ?").get(sessionId) as any).c;
    if (msgCount <= 2) {
      const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      db.prepare("UPDATE ai_sessions SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(title, sessionId);
    } else {
      db.prepare("UPDATE ai_sessions SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(sessionId);
    }

    res.json({ reply });
  } catch (err: any) {
    console.error("[AI] Error:", err.message);
    const reply = "Une erreur est survenue lors du traitement. Réessayez.";
    db.prepare("INSERT INTO ai_messages (sessionId, role, content) VALUES (?, ?, ?)").run(sessionId, "assistant", reply);
    res.json({ reply });
  }
});

export default router;

import { Router } from "express";
import axios from "axios";
import { authenticateToken } from "./auth.js";
import db from "../db.js";
import { getBotInfo, getBotGuilds, setBotStatus, isGatewayReady } from "../discord-gateway.js";

const router = Router();
const DISCORD_API = "https://discord.com/api/v10";

function botHeaders() {
  return {
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function requireBot(res: any) {
  if (!process.env.DISCORD_BOT_TOKEN) {
    res.status(500).json({ error: "Discord integration not configured" });
    return false;
  }
  return true;
}

// ── Configuration check ───────────────────────────────────────────────────────

router.get("/configured", authenticateToken, (_req, res) => {
  res.json({ configured: !!process.env.DISCORD_BOT_TOKEN });
});

// ── Bot info & status ─────────────────────────────────────────────────────────

router.get("/bot/info", authenticateToken, async (_req, res) => {
  if (!requireBot(res)) return;
  try {
    const info = getBotInfo();
    if (!info) {
      const r = await axios.get(`${DISCORD_API}/users/@me`, { headers: botHeaders() });
      return res.json({ ...r.data, gatewayReady: false, ping: -1 });
    }
    res.json({ ...info, gatewayReady: isGatewayReady() });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get bot info" });
  }
});

router.get("/bot/guilds", authenticateToken, (_req, res) => {
  if (!requireBot(res)) return;
  const guilds = getBotGuilds();
  res.json(guilds);
});

router.patch("/bot/status", authenticateToken, async (req: any, res) => {
  if (!requireBot(res)) return;
  const { status, activityName, activityType } = req.body;
  const validStatuses = ["online", "idle", "dnd", "invisible"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use: online, idle, dnd, invisible" });
  }
  try {
    await setBotStatus(status, activityName, activityType);
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to change status" });
  }
});

// ── Messaging ─────────────────────────────────────────────────────────────────

router.post("/message", authenticateToken, async (req: any, res) => {
  const { message, channelId } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  if (!requireBot(res)) return;

  const targetChannel = channelId || process.env.DISCORD_CHANNEL_ID;
  if (!targetChannel) return res.status(400).json({ error: "No channel configured" });

  try {
    const r = await axios.post(
      `${DISCORD_API}/channels/${targetChannel}/messages`,
      { content: message },
      { headers: botHeaders() }
    );
    res.json({ success: true, data: r.data });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/dm", authenticateToken, async (req: any, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "User ID and message required" });
  if (!requireBot(res)) return;
  try {
    const dmCh = await axios.post(`${DISCORD_API}/users/@me/channels`, { recipient_id: userId }, { headers: botHeaders() });
    const msg = await axios.post(`${DISCORD_API}/channels/${dmCh.data.id}/messages`, { content: message }, { headers: botHeaders() });
    res.json({ success: true, data: msg.data });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send DM" });
  }
});

router.get("/logs", authenticateToken, async (req: any, res) => {
  if (!requireBot(res)) return;
  const channelId = (req.query.channelId as string) || process.env.DISCORD_CHANNEL_ID;
  if (!channelId) return res.status(400).json({ error: "No channel configured" });
  try {
    const r = await axios.get(`${DISCORD_API}/channels/${channelId}/messages?limit=30`, { headers: botHeaders() });
    res.json(r.data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ── Guild channels ─────────────────────────────────────────────────────────────

router.get("/guild/:guildId/channels", authenticateToken, async (req, res) => {
  if (!requireBot(res)) return;
  try {
    const r = await axios.get(`${DISCORD_API}/guilds/${req.params.guildId}/channels`, { headers: botHeaders() });
    res.json(r.data.filter((c: any) => c.type === 0));
  } catch {
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

router.get("/guild/:guildId/members", authenticateToken, async (req, res) => {
  if (!requireBot(res)) return;
  try {
    const r = await axios.get(`${DISCORD_API}/guilds/${req.params.guildId}/members?limit=100`, { headers: botHeaders() });
    res.json(r.data.map((m: any) => ({
      id: m.user.id,
      username: m.user.username,
      avatar: m.user.avatar ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=64` : null,
      nick: m.nick,
      roles: m.roles,
      joinedAt: m.joined_at,
    })));
  } catch {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ── Moderation commands ───────────────────────────────────────────────────────

router.post("/commands/say", authenticateToken, async (req: any, res) => {
  const { channelId, message } = req.body;
  if (!channelId || !message) return res.status(400).json({ error: "channelId and message required" });
  if (!requireBot(res)) return;
  try {
    const r = await axios.post(`${DISCORD_API}/channels/${channelId}/messages`, { content: message }, { headers: botHeaders() });
    res.json({ success: true, messageId: r.data.id });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.message || "Failed to send message" });
  }
});

router.post("/commands/ban", authenticateToken, async (req: any, res) => {
  const { guildId, userId, reason, deleteMessageDays } = req.body;
  if (!guildId || !userId) return res.status(400).json({ error: "guildId and userId required" });
  if (!requireBot(res)) return;
  try {
    await axios.put(
      `${DISCORD_API}/guilds/${guildId}/bans/${userId}`,
      { reason: reason || "Banned via Nexus Dashboard", delete_message_seconds: (deleteMessageDays || 0) * 86400 },
      { headers: botHeaders() }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to ban user" });
  }
});

router.post("/commands/cleanban", authenticateToken, async (req: any, res) => {
  const { guildId, userId, reason } = req.body;
  if (!guildId || !userId) return res.status(400).json({ error: "guildId and userId required" });
  if (!requireBot(res)) return;
  try {
    await axios.put(
      `${DISCORD_API}/guilds/${guildId}/bans/${userId}`,
      { reason: reason || "Clean-banned via Nexus Dashboard", delete_message_seconds: 604800 },
      { headers: botHeaders() }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to cleanban user" });
  }
});

router.post("/commands/kick", authenticateToken, async (req: any, res) => {
  const { guildId, userId, reason } = req.body;
  if (!guildId || !userId) return res.status(400).json({ error: "guildId and userId required" });
  if (!requireBot(res)) return;
  try {
    await axios.delete(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
      headers: { ...botHeaders(), "X-Audit-Log-Reason": reason || "Kicked via Nexus Dashboard" },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to kick user" });
  }
});

router.post("/commands/mute", authenticateToken, async (req: any, res) => {
  const { guildId, userId, duration, reason } = req.body;
  if (!guildId || !userId || !duration) return res.status(400).json({ error: "guildId, userId and duration required" });
  if (!requireBot(res)) return;
  try {
    const until = new Date(Date.now() + duration * 60 * 1000).toISOString();
    await axios.patch(
      `${DISCORD_API}/guilds/${guildId}/members/${userId}`,
      { communication_disabled_until: until },
      { headers: { ...botHeaders(), "X-Audit-Log-Reason": reason || "Muted via Nexus Dashboard" } }
    );
    res.json({ success: true, until });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to mute user" });
  }
});

router.post("/commands/clearmute", authenticateToken, async (req: any, res) => {
  const { guildId, userId } = req.body;
  if (!guildId || !userId) return res.status(400).json({ error: "guildId and userId required" });
  if (!requireBot(res)) return;
  try {
    await axios.patch(
      `${DISCORD_API}/guilds/${guildId}/members/${userId}`,
      { communication_disabled_until: null },
      { headers: botHeaders() }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to clear mute" });
  }
});

router.post("/commands/warn", authenticateToken, async (req: any, res) => {
  const { guildId, userId, username, reason } = req.body;
  if (!guildId || !userId || !reason) return res.status(400).json({ error: "guildId, userId and reason required" });
  try {
    db.prepare(
      "INSERT INTO discord_warnings (guildId, userId, username, reason, warnedBy) VALUES (?, ?, ?, ?, ?)"
    ).run(guildId, userId, username || userId, reason, (req as any).user?.username);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save warning" });
  }
});

router.post("/commands/clearwarn", authenticateToken, async (req: any, res) => {
  const { guildId, userId, warnId } = req.body;
  if (!guildId) return res.status(400).json({ error: "guildId required" });
  try {
    if (warnId) {
      db.prepare("DELETE FROM discord_warnings WHERE id = ? AND guildId = ?").run(warnId, guildId);
    } else if (userId) {
      db.prepare("DELETE FROM discord_warnings WHERE userId = ? AND guildId = ?").run(userId, guildId);
    } else {
      return res.status(400).json({ error: "userId or warnId required" });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to clear warnings" });
  }
});

router.get("/commands/warnings", authenticateToken, (req: any, res) => {
  const { guildId, userId } = req.query;
  if (!guildId) return res.status(400).json({ error: "guildId required" });
  try {
    const rows = userId
      ? db.prepare("SELECT * FROM discord_warnings WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC").all(guildId, userId)
      : db.prepare("SELECT * FROM discord_warnings WHERE guildId = ? ORDER BY createdAt DESC LIMIT 50").all(guildId);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch warnings" });
  }
});

router.post("/commands/swipe", authenticateToken, async (req: any, res) => {
  const { channelId, guildId } = req.body;
  if (!channelId || !guildId) return res.status(400).json({ error: "channelId and guildId required" });
  if (!requireBot(res)) return;
  try {
    const chRes = await axios.get(`${DISCORD_API}/channels/${channelId}`, { headers: botHeaders() });
    const ch = chRes.data;
    await axios.delete(`${DISCORD_API}/channels/${channelId}`, { headers: botHeaders() });
    const newCh = await axios.post(
      `${DISCORD_API}/guilds/${guildId}/channels`,
      { name: ch.name, type: ch.type, topic: ch.topic, nsfw: ch.nsfw, position: ch.position, parent_id: ch.parent_id },
      { headers: botHeaders() }
    );
    res.json({ success: true, newChannelId: newCh.data.id });
  } catch (err: any) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.message || "Failed to swipe channel" });
  }
});

router.post("/commands/backup", authenticateToken, async (req: any, res) => {
  const { guildId } = req.body;
  if (!guildId) return res.status(400).json({ error: "guildId required" });
  if (!requireBot(res)) return;
  try {
    const [guildRes, channelsRes, rolesRes] = await Promise.all([
      axios.get(`${DISCORD_API}/guilds/${guildId}`, { headers: botHeaders() }),
      axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, { headers: botHeaders() }),
      axios.get(`${DISCORD_API}/guilds/${guildId}/roles`, { headers: botHeaders() }),
    ]);
    res.json({
      success: true,
      backup: {
        createdAt: new Date().toISOString(),
        guild: {
          id: guildRes.data.id,
          name: guildRes.data.name,
          description: guildRes.data.description,
          icon: guildRes.data.icon,
          memberCount: guildRes.data.approximate_member_count,
        },
        channels: channelsRes.data.map((c: any) => ({ id: c.id, name: c.name, type: c.type, position: c.position, parent_id: c.parent_id, topic: c.topic })),
        roles: rolesRes.data.map((r: any) => ({ id: r.id, name: r.name, color: r.color, permissions: r.permissions, position: r.position })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create backup" });
  }
});

export default router;

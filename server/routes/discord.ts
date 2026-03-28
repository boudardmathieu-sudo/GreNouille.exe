import { Router } from "express";
import axios from "axios";
import { authenticateToken } from "./auth.js";

const router = Router();

// Send message to Discord
router.post("/message", authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken || !channelId) {
    return res.status(500).json({ error: "Discord integration not configured" });
  }

  try {
    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      { content: message },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ success: true, data: response.data });
  } catch (err: any) {
    console.error("Discord API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send message to Discord" });
  }
});

// Send Direct Message (DM) to a specific Discord user
router.post("/dm", authenticateToken, async (req: any, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "User ID and message required" });

  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: "Discord bot token not configured" });
  }

  try {
    // 1. Create a DM channel with the user
    const dmChannelResponse = await axios.post(
      `https://discord.com/api/v10/users/@me/channels`,
      { recipient_id: userId },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const dmChannelId = dmChannelResponse.data.id;

    // 2. Send the message to the DM channel
    const messageResponse = await axios.post(
      `https://discord.com/api/v10/channels/${dmChannelId}/messages`,
      { content: message },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: messageResponse.data });
  } catch (err: any) {
    console.error("Discord DM Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send DM to Discord user" });
  }
});

// Get recent messages (Logs)
router.get("/logs", authenticateToken, async (req: any, res) => {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!botToken || !channelId) {
    return res.status(500).json({ error: "Discord integration not configured" });
  }

  try {
    const response = await axios.get(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=20`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (err: any) {
    console.error("Discord API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Discord logs" });
  }
});

export default router;

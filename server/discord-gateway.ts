import { Client, GatewayIntentBits, ActivityType, PresenceStatusData } from "discord.js";

let client: Client | null = null;
let gatewayReady = false;

export async function initDiscordGateway() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.log("[Discord] Bot token not configured, skipping gateway init.");
    return;
  }

  try {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
      ],
    });

    client.once("ready", () => {
      gatewayReady = true;
      console.log(`[Discord] Gateway ready — logged in as ${client!.user!.tag}`);
    });

    client.on("error", (err) => {
      console.error("[Discord] Gateway error:", err.message);
    });

    await client.login(botToken);
  } catch (err: any) {
    console.error("[Discord] Failed to login to gateway:", err.message);
    client = null;
    gatewayReady = false;
  }
}

export function getDiscordClient(): Client | null {
  return client;
}

export function isGatewayReady(): boolean {
  return gatewayReady && client !== null;
}

export async function setBotStatus(status: PresenceStatusData, activityName?: string, activityType?: number) {
  if (!client?.user) throw new Error("Discord client not connected");
  client.user.setPresence({
    status,
    activities: activityName
      ? [{ name: activityName, type: (activityType ?? ActivityType.Playing) as any }]
      : [],
  });
}

export function getBotInfo() {
  if (!client?.user) return null;
  return {
    username: client.user.username,
    discriminator: client.user.discriminator,
    id: client.user.id,
    avatarUrl: client.user.displayAvatarURL({ size: 256 }),
    ping: client.ws.ping,
    guildCount: client.guilds.cache.size,
    status: client.user.presence?.status ?? "online",
    uptime: client.uptime ? Math.floor(client.uptime / 1000) : 0,
    tag: client.user.tag,
  };
}

export function getBotGuilds() {
  if (!client) return [];
  return client.guilds.cache.map((g) => ({
    id: g.id,
    name: g.name,
    memberCount: g.memberCount,
    iconUrl: g.iconURL({ size: 64 }) ?? null,
  }));
}

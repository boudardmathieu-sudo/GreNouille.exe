import {
  Client,
  GatewayIntentBits,
  ActivityType,
  PresenceStatusData,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  GuildMember,
  Collection,
} from "discord.js";
import db from "./db.js";

let client: Client | null = null;
let gatewayReady = false;

// ── Slash commands definitions ─────────────────────────────────────────────────

const slashCommands = [
  // ── Info & Utilitaires ──
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Affiche la latence du bot"),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Affiche les informations du bot"),

  new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Affiche depuis combien de temps le bot est en ligne"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste de toutes les commandes disponibles"),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Affiche les informations du serveur"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Affiche les informations d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à inspecter").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Affiche l'avatar d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Affiche la bannière d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("rolelist")
    .setDescription("Affiche la liste des rôles du serveur"),

  new SlashCommandBuilder()
    .setName("channellist")
    .setDescription("Affiche la liste des salons du serveur"),

  new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Affiche le nombre de membres du serveur"),

  // ── Fun ──
  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Pile ou face !"),

  new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Lance un dé")
    .addIntegerOption((o) =>
      o.setName("faces").setDescription("Nombre de faces du dé (défaut: 6)").setRequired(false).setMinValue(2).setMaxValue(1000)
    ),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("La boule magique répond à tes questions !")
    .addStringOption((o) =>
      o.setName("question").setDescription("Ta question").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("choix")
    .setDescription("Choisit aléatoirement parmi plusieurs options")
    .addStringOption((o) =>
      o.setName("options").setDescription("Options séparées par des virgules (ex: oui, non, peut-être)").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("pp")
    .setDescription("Mesure quelque chose de façon très scientifique 📏")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à mesurer").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Envoie un câlin à quelqu'un 🤗")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à câliner").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Gifle quelqu'un 👋")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à gifler").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("iq")
    .setDescription("Calcule le QI d'un membre 🧠")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à analyser").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("niveau")
    .setDescription("Affiche le niveau de quelque chose pour un membre")
    .addStringOption((o) =>
      o.setName("chose").setDescription("La chose à mesurer (ex: skill, chance, swag...)").setRequired(true)
    )
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("mdr")
    .setDescription("Combien est-ce que t'es drôle ? 😂")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à évaluer").setRequired(false)
    ),

  // ── Communication ──
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Fait parler le bot dans un salon")
    .addStringOption((o) =>
      o.setName("message").setDescription("Le message à envoyer").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon cible (défaut: salon actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Envoie un message embed stylé")
    .addStringOption((o) =>
      o.setName("titre").setDescription("Le titre de l'embed").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("description").setDescription("La description de l'embed").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("couleur").setDescription("Couleur hex (ex: #7289DA)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Crée un sondage avec des réactions")
    .addStringOption((o) =>
      o.setName("question").setDescription("La question du sondage").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("option1").setDescription("Première option").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option2").setDescription("Deuxième option").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option3").setDescription("Troisième option").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("option4").setDescription("Quatrième option").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Envoie une annonce dans un salon")
    .addStringOption((o) =>
      o.setName("message").setDescription("Le message d'annonce").setRequired(true)
    )
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon cible").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // ── Modération ──
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannit un membre du serveur")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à bannir").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du ban").setRequired(false)
    )
    .addIntegerOption((o) =>
      o.setName("supprimer").setDescription("Supprimer X jours de messages (0-7)").setRequired(false).setMinValue(0).setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulse un membre du serveur")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à expulser").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du kick").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Met en sourdine un membre (timeout)")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à mute").setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName("duree").setDescription("Durée en minutes").setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison du mute").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Retire le timeout d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à unmute").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertit un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à avertir").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("raison").setDescription("Raison de l'avertissement").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warns")
    .setDescription("Affiche les avertissements d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre à inspecter").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Supprime les avertissements d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime des messages en masse")
    .addIntegerOption((o) =>
      o.setName("nombre").setDescription("Nombre de messages à supprimer (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((o) =>
      o.setName("membre").setDescription("Supprimer seulement les messages de ce membre").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Définit le mode lent du salon")
    .addIntegerOption((o) =>
      o.setName("secondes").setDescription("Délai en secondes (0 pour désactiver)").setRequired(true).setMinValue(0).setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Verrouille le salon (personne ne peut écrire)")
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon à verrouiller (défaut: actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Déverrouille le salon")
    .addChannelOption((o) =>
      o.setName("salon").setDescription("Le salon à déverrouiller (défaut: actuel)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Ajoute ou retire un rôle à un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName("role").setDescription("Le rôle à ajouter/retirer").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change le surnom d'un membre")
    .addUserOption((o) =>
      o.setName("membre").setDescription("Le membre cible").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("surnom").setDescription("Le nouveau surnom (vide pour supprimer)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Débannit un utilisateur")
    .addStringOption((o) =>
      o.setName("userid").setDescription("L'ID de l'utilisateur à débannir").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("banlist")
    .setDescription("Affiche la liste des membres bannis")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
].map((cmd) => cmd.toJSON());

// ── Register slash commands ────────────────────────────────────────────────────

async function registerSlashCommands(botToken: string, clientId: string) {
  const rest = new REST({ version: "10" }).setToken(botToken);
  const guildId = process.env.DISCORD_GUILD_ID;
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log(`[Discord] Slash commands registered for guild ${guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log("[Discord] Slash commands registered globally");
    }
  } catch (err: any) {
    console.error("[Discord] Failed to register slash commands:", err.message);
  }
}

// ── 8ball responses ────────────────────────────────────────────────────────────

const eightBallResponses = [
  "✅ Oui, absolument !",
  "✅ C'est certain.",
  "✅ Sans aucun doute.",
  "✅ Oui, définitivement.",
  "✅ Tu peux compter dessus.",
  "🤷 Réponds pas claire pour l'instant.",
  "🤷 Demande plus tard.",
  "🤷 Mieux vaut ne pas te le dire maintenant.",
  "🤷 Impossible de prédire pour l'instant.",
  "❌ Ne compte pas dessus.",
  "❌ Ma réponse est non.",
  "❌ Mes sources disent non.",
  "❌ Les perspectives ne sont pas bonnes.",
  "❌ Très douteux.",
];

// ── Handle slash commands ──────────────────────────────────────────────────────

function parseColor(hex: string | null): number {
  if (!hex) return 0x5865f2;
  return parseInt(hex.replace("#", ""), 16) || 0x5865f2;
}

async function handleInteraction(interaction: any) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const guild = interaction.guild;
  const member = interaction.member as GuildMember;

  try {
    // ── ping ──
    if (commandName === "ping") {
      const latency = client!.ws.ping;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🏓 Pong !")
            .addFields(
              { name: "Latence Bot", value: `\`${latency}ms\``, inline: true },
              { name: "Latence API", value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true }
            ),
        ],
      });
    }

    // ── botinfo ──
    else if (commandName === "botinfo") {
      const uptimeSec = Math.floor((client!.uptime ?? 0) / 1000);
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🤖 Informations du Bot")
            .setThumbnail(client!.user!.displayAvatarURL())
            .addFields(
              { name: "Nom", value: client!.user!.tag, inline: true },
              { name: "ID", value: client!.user!.id, inline: true },
              { name: "Serveurs", value: `${client!.guilds.cache.size}`, inline: true },
              { name: "Latence", value: `${client!.ws.ping}ms`, inline: true },
              { name: "Uptime", value: `${h}h ${m}m ${s}s`, inline: true },
              { name: "Version discord.js", value: "14.x", inline: true }
            )
            .setFooter({ text: "Nexus Panel Bot" })
            .setTimestamp(),
        ],
      });
    }

    // ── uptime ──
    else if (commandName === "uptime") {
      const uptimeSec = Math.floor((client!.uptime ?? 0) / 1000);
      const days = Math.floor(uptimeSec / 86400);
      const h = Math.floor((uptimeSec % 86400) / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00b4d8)
            .setTitle("⏱️ Uptime")
            .setDescription(`Le bot est en ligne depuis **${days}j ${h}h ${m}m ${s}s**`),
        ],
      });
    }

    // ── help ──
    else if (commandName === "help") {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📖 Commandes disponibles")
            .addFields(
              {
                name: "📊 Informations",
                value: "`/ping` `/botinfo` `/uptime` `/serverinfo` `/userinfo` `/avatar` `/banner` `/rolelist` `/channellist` `/membercount`",
              },
              {
                name: "🎉 Fun",
                value: "`/coinflip` `/roll` `/8ball` `/choix` `/pp` `/hug` `/slap` `/iq` `/niveau` `/mdr`",
              },
              {
                name: "📢 Communication",
                value: "`/say` `/embed` `/poll` `/announce`",
              },
              {
                name: "🔨 Modération",
                value: "`/ban` `/kick` `/mute` `/unmute` `/warn` `/warns` `/clearwarns` `/clear` `/slowmode` `/lock` `/unlock` `/role` `/nick` `/unban` `/banlist`",
              }
            )
            .setFooter({ text: `Mentionne-moi pour plus d'infos !` })
            .setTimestamp(),
        ],
      });
    }

    // ── serverinfo ──
    else if (commandName === "serverinfo") {
      if (!guild) return interaction.reply({ content: "Commande uniquement disponible dans un serveur.", ephemeral: true });
      const owner = await guild.fetchOwner();
      const created = Math.floor(guild.createdTimestamp / 1000);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf4a261)
            .setTitle(`🏠 ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 256 }) ?? null)
            .addFields(
              { name: "ID", value: guild.id, inline: true },
              { name: "Propriétaire", value: owner.user.tag, inline: true },
              { name: "Membres", value: `${guild.memberCount}`, inline: true },
              { name: "Salons", value: `${guild.channels.cache.size}`, inline: true },
              { name: "Rôles", value: `${guild.roles.cache.size}`, inline: true },
              { name: "Boosts", value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
              { name: "Créé le", value: `<t:${created}:D>`, inline: true },
              { name: "Niveau de boost", value: `Niveau ${guild.premiumTier}`, inline: true },
            )
            .setTimestamp(),
        ],
      });
    }

    // ── userinfo ──
    else if (commandName === "userinfo") {
      const target = interaction.options.getMember("membre") as GuildMember | null ?? member;
      const user = target.user;
      const joinedAt = target.joinedTimestamp ? Math.floor(target.joinedTimestamp / 1000) : 0;
      const createdAt = Math.floor(user.createdTimestamp / 1000);
      const roles = target.roles.cache.filter((r) => r.id !== guild?.id).map((r) => `<@&${r.id}>`).join(", ") || "Aucun";
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x90e0ef)
            .setTitle(`👤 ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
              { name: "ID", value: user.id, inline: true },
              { name: "Pseudo", value: target.displayName, inline: true },
              { name: "Bot", value: user.bot ? "Oui" : "Non", inline: true },
              { name: "Compte créé le", value: `<t:${createdAt}:D>`, inline: false },
              { name: "A rejoint le", value: joinedAt ? `<t:${joinedAt}:D>` : "Inconnu", inline: false },
              { name: `Rôles (${target.roles.cache.size - 1})`, value: roles.length > 1024 ? roles.slice(0, 1020) + "..." : roles, inline: false },
            )
            .setTimestamp(),
        ],
      });
    }

    // ── avatar ──
    else if (commandName === "avatar") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const avatarUrl = target.displayAvatarURL({ size: 512 });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`🖼️ Avatar de ${target.username}`)
            .setImage(avatarUrl)
            .addFields({ name: "Lien direct", value: `[Cliquez ici](${avatarUrl})` }),
        ],
      });
    }

    // ── banner ──
    else if (commandName === "banner") {
      const target = await (interaction.options.getUser("membre") ?? interaction.user).fetch();
      const bannerUrl = (target as any).bannerURL?.({ size: 512 });
      if (!bannerUrl) {
        return interaction.reply({ content: "Cet utilisateur n'a pas de bannière.", ephemeral: true });
      }
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle(`🖼️ Bannière de ${target.username}`)
            .setImage(bannerUrl),
        ],
      });
    }

    // ── rolelist ──
    else if (commandName === "rolelist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const roles = guild.roles.cache
        .filter((r) => r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => `<@&${r.id}>`)
        .slice(0, 30)
        .join(", ");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe76f51)
            .setTitle(`🎭 Rôles du serveur (${guild.roles.cache.size - 1})`)
            .setDescription(roles || "Aucun rôle"),
        ],
      });
    }

    // ── channellist ──
    else if (commandName === "channellist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const text = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).map((c) => `<#${c.id}>`).slice(0, 20).join(", ");
      const voice = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).map((c) => `🔊 ${c.name}`).slice(0, 10).join(", ");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x52b788)
            .setTitle(`📋 Salons du serveur`)
            .addFields(
              { name: `💬 Texte (${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size})`, value: text || "Aucun" },
              { name: `🔊 Vocal (${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size})`, value: voice || "Aucun" },
            ),
        ],
      });
    }

    // ── membercount ──
    else if (commandName === "membercount") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const bots = guild.members.cache.filter((m) => m.user.bot).size;
      const humans = guild.memberCount - bots;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x80b918)
            .setTitle("👥 Membres du serveur")
            .addFields(
              { name: "Total", value: `${guild.memberCount}`, inline: true },
              { name: "Humains", value: `${humans}`, inline: true },
              { name: "Bots", value: `${bots}`, inline: true },
            ),
        ],
      });
    }

    // ── coinflip ──
    else if (commandName === "coinflip") {
      const result = Math.random() < 0.5 ? "🪙 Pile !" : "🟡 Face !";
      await interaction.reply({ content: `**${interaction.user.username}** lance la pièce... **${result}**` });
    }

    // ── roll ──
    else if (commandName === "roll") {
      const faces = interaction.options.getInteger("faces") ?? 6;
      const result = Math.floor(Math.random() * faces) + 1;
      await interaction.reply({ content: `🎲 **${interaction.user.username}** lance un dé à **${faces}** faces et obtient... **${result}** !` });
    }

    // ── 8ball ──
    else if (commandName === "8ball") {
      const question = interaction.options.getString("question", true);
      const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🎱 La Boule Magique")
            .addFields(
              { name: "❓ Question", value: question },
              { name: "🔮 Réponse", value: response }
            ),
        ],
      });
    }

    // ── choix ──
    else if (commandName === "choix") {
      const rawOptions = interaction.options.getString("options", true);
      const choices = rawOptions.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (choices.length < 2) return interaction.reply({ content: "Il faut au moins 2 options séparées par des virgules !", ephemeral: true });
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffd60a)
            .setTitle("🎯 Je choisis...")
            .setDescription(`**${chosen}** !`)
            .setFooter({ text: `Options : ${choices.join(" · ")}` }),
        ],
      });
    }

    // ── pp ──
    else if (commandName === "pp") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const size = Math.floor(Math.random() * 30);
      const bar = "8" + "=".repeat(size) + "D";
      await interaction.reply({ content: `📏 **${target.username}** : \`${bar}\` (${size} cm)` });
    }

    // ── hug ──
    else if (commandName === "hug") {
      const target = interaction.options.getUser("membre", true);
      await interaction.reply({ content: `🤗 **${interaction.user.username}** fait un gros câlin à **${target.username}** !` });
    }

    // ── slap ──
    else if (commandName === "slap") {
      const target = interaction.options.getUser("membre", true);
      await interaction.reply({ content: `👋 **${interaction.user.username}** gifle **${target.username}** ! Aïe !` });
    }

    // ── iq ──
    else if (commandName === "iq") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const iq = Math.floor(Math.random() * 200) + 50;
      let comment = iq < 80 ? "🥴 Hmm..." : iq < 100 ? "😐 Dans la moyenne..." : iq < 140 ? "😎 Pas mal !" : "🧠 Génie !";
      await interaction.reply({ content: `🧠 **${target.username}** a un QI de **${iq}** — ${comment}` });
    }

    // ── niveau ──
    else if (commandName === "niveau") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const chose = interaction.options.getString("chose", true);
      const pct = Math.floor(Math.random() * 101);
      const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
      await interaction.reply({ content: `📊 Niveau **${chose}** de **${target.username}** :\n\`${bar}\` **${pct}%**` });
    }

    // ── mdr ──
    else if (commandName === "mdr") {
      const target = interaction.options.getUser("membre") ?? interaction.user;
      const pct = Math.floor(Math.random() * 101);
      await interaction.reply({ content: `😂 **${target.username}** est drôle à **${pct}%**` });
    }

    // ── say ──
    else if (commandName === "say") {
      const message = interaction.options.getString("message", true);
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.send(message);
      await interaction.reply({ content: "✅ Message envoyé !", ephemeral: true });
    }

    // ── embed ──
    else if (commandName === "embed") {
      const titre = interaction.options.getString("titre", true);
      const description = interaction.options.getString("description", true);
      const couleur = interaction.options.getString("couleur");
      const channel = interaction.channel as TextChannel;
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(parseColor(couleur) as any)
            .setTitle(titre)
            .setDescription(description)
            .setTimestamp(),
        ],
      });
      await interaction.reply({ content: "✅ Embed envoyé !", ephemeral: true });
    }

    // ── poll ──
    else if (commandName === "poll") {
      const question = interaction.options.getString("question", true);
      const opts = [
        interaction.options.getString("option1"),
        interaction.options.getString("option2"),
        interaction.options.getString("option3"),
        interaction.options.getString("option4"),
      ].filter(Boolean) as string[];

      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
      let description: string;
      if (opts.length === 0) {
        description = "Réagissez avec 👍 ou 👎";
      } else {
        description = opts.map((o, i) => `${emojis[i]} ${o}`).join("\n");
      }

      const pollMsg = await (interaction.channel as TextChannel).send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffd60a)
            .setTitle(`📊 Sondage : ${question}`)
            .setDescription(description)
            .setFooter({ text: `Sondage lancé par ${interaction.user.tag}` })
            .setTimestamp(),
        ],
      });

      if (opts.length === 0) {
        await pollMsg.react("👍");
        await pollMsg.react("👎");
      } else {
        for (let i = 0; i < opts.length; i++) {
          await pollMsg.react(emojis[i]);
        }
      }

      await interaction.reply({ content: "✅ Sondage créé !", ephemeral: true });
    }

    // ── announce ──
    else if (commandName === "announce") {
      const message = interaction.options.getString("message", true);
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff6b6b)
            .setTitle("📢 Annonce")
            .setDescription(message)
            .setFooter({ text: `Annoncé par ${interaction.user.tag}` })
            .setTimestamp(),
        ],
      });
      await interaction.reply({ content: "✅ Annonce envoyée !", ephemeral: true });
    }

    // ── ban ──
    else if (commandName === "ban") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      const supprimer = interaction.options.getInteger("supprimer") ?? 0;
      await guild.members.ban(target, { reason: raison, deleteMessageSeconds: supprimer * 86400 });
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🔨 Banni")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Raison", value: raison, inline: true }
            ),
        ],
      });
    }

    // ── kick ──
    else if (commandName === "kick") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      await target.kick(raison);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff8800)
            .setTitle("👢 Expulsé")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Raison", value: raison, inline: true }
            ),
        ],
      });
    }

    // ── mute ──
    else if (commandName === "mute") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const duree = interaction.options.getInteger("duree", true);
      const raison = interaction.options.getString("raison") ?? "Aucune raison fournie";
      const until = new Date(Date.now() + duree * 60 * 1000);
      await target.timeout(duree * 60 * 1000, raison);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle("🔇 Mute")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Durée", value: `${duree} minute(s)`, inline: true },
              { name: "Fin du mute", value: `<t:${Math.floor(until.getTime() / 1000)}:R>`, inline: true },
              { name: "Raison", value: raison, inline: false },
            ),
        ],
      });
    }

    // ── unmute ──
    else if (commandName === "unmute") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      await target.timeout(null);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🔊 Unmute")
            .setDescription(`**${target.user.tag}** n'est plus en sourdine.`),
        ],
      });
    }

    // ── warn ──
    else if (commandName === "warn") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const raison = interaction.options.getString("raison", true);
      db.prepare(
        "INSERT INTO discord_warnings (guildId, userId, username, reason, warnedBy) VALUES (?, ?, ?, ?, ?)"
      ).run(guild.id, target.user.id, target.user.username, raison, interaction.user.username);
      const count = (db.prepare("SELECT COUNT(*) as c FROM discord_warnings WHERE guildId = ? AND userId = ?").get(guild.id, target.user.id) as any).c;
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle("⚠️ Avertissement")
            .addFields(
              { name: "Membre", value: target.user.tag, inline: true },
              { name: "Total warns", value: `${count}`, inline: true },
              { name: "Raison", value: raison, inline: false },
            ),
        ],
      });
    }

    // ── warns ──
    else if (commandName === "warns") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const rows = db.prepare("SELECT * FROM discord_warnings WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC").all(guild.id, target.user.id) as any[];
      if (rows.length === 0) {
        return interaction.reply({ content: `✅ **${target.user.tag}** n'a aucun avertissement.`, ephemeral: true });
      }
      const list = rows.map((w, i) => `**${i + 1}.** ${w.reason} — *par ${w.warnedBy ?? "?"}* (<t:${Math.floor(new Date(w.createdAt).getTime() / 1000)}:d>)`).join("\n");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle(`⚠️ Avertissements de ${target.user.tag}`)
            .setDescription(list.slice(0, 4096)),
        ],
      });
    }

    // ── clearwarns ──
    else if (commandName === "clearwarns") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      db.prepare("DELETE FROM discord_warnings WHERE guildId = ? AND userId = ?").run(guild.id, target.user.id);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00d166)
            .setTitle("🧹 Warns supprimés")
            .setDescription(`Les avertissements de **${target.user.tag}** ont été supprimés.`),
        ],
      });
    }

    // ── clear ──
    else if (commandName === "clear") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const nombre = interaction.options.getInteger("nombre", true);
      const targetUser = interaction.options.getUser("membre");
      const channel = interaction.channel as TextChannel;
      await interaction.deferReply({ ephemeral: true });
      let messages = await channel.messages.fetch({ limit: Math.min(nombre + 1, 100) });
      if (targetUser) {
        messages = messages.filter((m) => m.author.id === targetUser.id);
      }
      const toDelete = messages.filter((m) => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
      const deleted = await channel.bulkDelete(toDelete, true);
      await interaction.editReply({ content: `✅ **${deleted.size}** message(s) supprimé(s).` });
    }

    // ── slowmode ──
    else if (commandName === "slowmode") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const secondes = interaction.options.getInteger("secondes", true);
      const channel = interaction.channel as TextChannel;
      await channel.setRateLimitPerUser(secondes);
      const msg = secondes === 0 ? "Mode lent désactivé." : `Mode lent défini à **${secondes} secondes**.`;
      await interaction.reply({ content: `⏱️ ${msg}`, ephemeral: true });
    }

    // ── lock ──
    else if (commandName === "lock") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      await interaction.reply({ content: `🔒 **${channel.name}** est maintenant verrouillé.` });
    }

    // ── unlock ──
    else if (commandName === "unlock") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const channel = (interaction.options.getChannel("salon") ?? interaction.channel) as TextChannel;
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
      await interaction.reply({ content: `🔓 **${channel.name}** est maintenant déverrouillé.` });
    }

    // ── role ──
    else if (commandName === "role") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      const role = interaction.options.getRole("role");
      if (!target || !role) return interaction.reply({ content: "Membre ou rôle introuvable.", ephemeral: true });
      if (target.roles.cache.has(role.id)) {
        await target.roles.remove(role.id);
        await interaction.reply({ content: `✅ Rôle **${role.name}** retiré de **${target.user.tag}**.` });
      } else {
        await target.roles.add(role.id);
        await interaction.reply({ content: `✅ Rôle **${role.name}** ajouté à **${target.user.tag}**.` });
      }
    }

    // ── nick ──
    else if (commandName === "nick") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const target = interaction.options.getMember("membre") as GuildMember | null;
      if (!target) return interaction.reply({ content: "Membre introuvable.", ephemeral: true });
      const surnom = interaction.options.getString("surnom") ?? null;
      await target.setNickname(surnom);
      const msg = surnom ? `Surnom de **${target.user.tag}** changé en **${surnom}**.` : `Surnom de **${target.user.tag}** supprimé.`;
      await interaction.reply({ content: `✅ ${msg}`, ephemeral: true });
    }

    // ── unban ──
    else if (commandName === "unban") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const userId = interaction.options.getString("userid", true);
      await guild.members.unban(userId);
      await interaction.reply({ content: `✅ L'utilisateur \`${userId}\` a été débanni.` });
    }

    // ── banlist ──
    else if (commandName === "banlist") {
      if (!guild) return interaction.reply({ content: "Serveur uniquement.", ephemeral: true });
      const bans = await guild.bans.fetch();
      if (bans.size === 0) {
        return interaction.reply({ content: "✅ Aucun membre banni.", ephemeral: true });
      }
      const list = bans.map((b) => `**${b.user.tag}** — ${b.reason ?? "Aucune raison"}`).slice(0, 20).join("\n");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`🔨 Membres bannis (${bans.size})`)
            .setDescription(list),
        ],
        ephemeral: true,
      });
    }

  } catch (err: any) {
    console.error(`[Discord] Error handling /${commandName}:`, err.message);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Une erreur est survenue.", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
      }
    } catch {}
  }
}

// ── Handle @mention messages ───────────────────────────────────────────────────

async function handleMention(message: any) {
  if (!client?.user) return;
  if (!message.mentions.has(client.user.id)) return;
  if (message.author.bot) return;

  const content = message.content.replace(`<@${client.user.id}>`, "").replace(`<@!${client.user.id}>`, "").trim().toLowerCase();

  if (content === "" || content === "help" || content === "aide" || content === "commandes") {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("👋 Salut ! Je suis GreNouille.exe")
          .setDescription("Voici ce que je peux faire :")
          .addFields(
            { name: "📊 Info", value: "`/ping` `/botinfo` `/serverinfo` `/userinfo` `/avatar` `/membercount`" },
            { name: "🎉 Fun", value: "`/coinflip` `/roll` `/8ball` `/choix` `/hug` `/slap` `/iq`" },
            { name: "📢 Com.", value: "`/say` `/embed` `/poll` `/announce`" },
            { name: "🔨 Mod", value: "`/ban` `/kick` `/mute` `/warn` `/clear` `/lock`" }
          )
          .setFooter({ text: "Utilise /help pour la liste complète !" }),
      ],
    });
  } else if (content === "ping") {
    await message.reply(`🏓 Pong ! Latence : **${client.ws.ping}ms**`);
  } else if (content === "bonjour" || content === "salut" || content === "hello" || content === "coucou" || content === "yo") {
    const greetings = [
      `Hey **${message.author.username}** ! 👋`,
      `Salut **${message.author.username}** ! 🐸`,
      `Coucou **${message.author.username}** ! ✨`,
      `Yo **${message.author.username}** ! 😎`,
    ];
    await message.reply(greetings[Math.floor(Math.random() * greetings.length)]);
  } else {
    await message.reply(`Hey **${message.author.username}** ! Tape \`/help\` ou mentionne-moi avec \`help\` pour voir mes commandes. 🐸`);
  }
}

// ── Gateway init ───────────────────────────────────────────────────────────────

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
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once("ready", async () => {
      gatewayReady = true;
      console.log(`[Discord] Gateway ready — logged in as ${client!.user!.tag}`);
      await registerSlashCommands(botToken, client!.user!.id);
    });

    client.on("interactionCreate", handleInteraction);

    client.on("messageCreate", handleMention);

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

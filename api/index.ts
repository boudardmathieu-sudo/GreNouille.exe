import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "../server/routes/auth.js";
import spotifyRoutes from "../server/routes/spotify.js";
import discordRoutes from "../server/routes/discord.js";
import databaseRoutes from "../server/routes/database.js";
import logsRoutes from "../server/routes/logs.js";
import analyticsRoutes from "../server/routes/analytics.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/discord", discordRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;

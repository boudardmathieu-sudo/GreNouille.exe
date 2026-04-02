import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Play, Plus, Music, Pause, SkipBack, SkipForward,
  Maximize2, Volume2, VolumeX, Volume1, Shuffle, Repeat, Repeat1,
  History, Loader2, Unlink, Heart, MonitorSpeaker, Smartphone,
  Monitor, Speaker, Laptop, Mic, MicOff, Sparkles, Check,
  X, ChevronDown, Wifi, WifiOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSpotify } from "../context/SpotifyContext";
import axios from "axios";

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function DeviceIcon({ type }: { type: string }) {
  const t = (type || "").toLowerCase();
  if (t.includes("smartphone") || t.includes("phone")) return <Smartphone className="h-4 w-4" />;
  if (t.includes("computer") || t.includes("laptop")) return <Laptop className="h-4 w-4" />;
  if (t.includes("speaker")) return <Speaker className="h-4 w-4" />;
  if (t.includes("tv") || t.includes("cast")) return <Monitor className="h-4 w-4" />;
  return <MonitorSpeaker className="h-4 w-4" />;
}

export default function Spotify() {
  const { user, checkAuth } = useAuth();
  const {
    currentTrack, isPlaying, volume, shuffle, repeatMode, needsReauth,
    deviceId, progress, duration, devices, likedIds,
    playTrack, pauseTrack, skipNext, skipPrev,
    setVolume, toggleShuffle, toggleRepeat, disconnectSpotify, reconnect,
    transferPlayback, fetchDevices, toggleLike, seekTo,
  } = useSpotify();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [authError, setAuthError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsTrackId, setLyricsTrackId] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"discover" | "recent">("discover");
  const [hasSearched, setHasSearched] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [seekDragging, setSeekDragging] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volMuted, setVolMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.5);
  const [copied, setCopied] = useState(false);

  const devicesRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const callbackUrl = `${window.location.origin}/spotify/callback`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Auto-fetch lyrics on track change
  useEffect(() => {
    if (!currentTrack || currentTrack.id === lyricsTrackId) return;
    setLyricsTrackId(currentTrack.id);
    setLyrics("");
    setLyricsLoading(true);
    const artist = currentTrack.artists?.[0]?.name;
    const title = currentTrack.name?.split(" - ")[0];
    if (!artist || !title) { setLyricsLoading(false); return; }
    axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
      .then((r) => setLyrics(r.data.lyrics || ""))
      .catch(() => setLyrics(""))
      .finally(() => setLyricsLoading(false));
  }, [currentTrack?.id]);

  useEffect(() => {
    if (lyricsRef.current) lyricsRef.current.scrollTop = 0;
  }, [currentTrack?.id]);

  const fetchRecommendations = useCallback(async () => {
    if (!user?.hasSpotify) return;
    setRecLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentTrack?.id) params.set("trackId", currentTrack.id);
      if (currentTrack?.artists?.[0]?.id) params.set("artistId", currentTrack.artists[0].id);
      const r = await axios.get(`/api/spotify/recommendations?${params.toString()}`);
      setRecommendations(r.data || []);
    } catch {}
    finally { setRecLoading(false); }
  }, [user?.hasSpotify, currentTrack?.id]);

  useEffect(() => {
    if (!hasSearched) fetchRecommendations();
  }, [currentTrack?.id, hasSearched]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "SPOTIFY_AUTH_SUCCESS") { checkAuth(); reconnect(); }
      else if (e.data?.type === "SPOTIFY_AUTH_ERROR") setAuthError(e.data.error || "Échec connexion Spotify.");
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [checkAuth, reconnect]);

  useEffect(() => {
    if (activeTab === "recent" && user?.hasSpotify) {
      axios.get("/api/spotify/player/recently-played")
        .then((r) => setRecentlyPlayed(r.data || []))
        .catch(() => {});
    }
  }, [activeTab, user?.hasSpotify]);

  useEffect(() => {
    if (!seekDragging) setSeekValue(progress);
  }, [progress, seekDragging]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (devicesRef.current && !devicesRef.current.contains(e.target as Node)) setShowDevices(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const connectSpotify = async () => {
    setAuthError("");
    try {
      const res = await axios.get(`/api/spotify/url?redirectUri=${encodeURIComponent(callbackUrl)}`);
      window.open(res.data.url, "spotify_auth", "width=600,height=700");
    } catch (err: any) {
      setAuthError(err.response?.data?.error || "Échec de la connexion.");
    }
  };

  const searchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    setLoading(true);
    try {
      const res = await axios.get(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch { showToast("Recherche échouée."); }
    finally { setLoading(false); }
  };

  const clearSearch = () => { setQuery(""); setResults([]); setHasSearched(false); };

  const addToPlaylist = async (trackUri: string) => {
    try {
      await axios.post("/api/spotify/playlist/add", { trackUri });
      showToast("Ajouté à la playlist !");
    } catch { showToast("Impossible d'ajouter."); }
  };

  const handlePlayTrack = async (uri?: string) => {
    try { await playTrack(uri); }
    catch { showToast("Lance Spotify sur un appareil d'abord."); }
  };

  const handleDisconnect = async () => {
    setConfirmDisconnect(false);
    await disconnectSpotify();
    await checkAuth();
    showToast("Spotify déconnecté.");
  };

  const handleOpenDevices = async () => {
    const next = !showDevices;
    setShowDevices(next);
    if (next) {
      setLoadingDevices(true);
      await fetchDevices();
      setLoadingDevices(false);
    }
  };

  const handleMuteToggle = () => {
    if (volMuted) { setVolMuted(false); setVolume(prevVol); }
    else { setPrevVol(volume); setVolMuted(true); setVolume(0); }
  };

  const VolumeIcon = volMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 2 ? Repeat1 : Repeat;

  // ── Connect page ─────────────────────────────────────────────────────────
  if (!user?.hasSpotify) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Music className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">Connecter Spotify</h2>
          <p className="mb-6 text-gray-400 text-sm leading-relaxed">Liez votre compte Spotify pour contrôler la lecture, voir les paroles et découvrir de la musique.</p>
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left">
            <p className="mb-2 font-bold text-yellow-400 text-xs uppercase tracking-wider">Configuration requise</p>
            <p className="mb-3 text-sm text-yellow-200">Ajoutez cette URL dans votre <strong>Spotify Developer Dashboard</strong> → Redirect URIs.</p>
            <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2">
              <code className="flex-1 font-mono text-xs text-emerald-400 break-all">{callbackUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(callbackUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
              >{copied ? "✓" : "Copier"}</button>
            </div>
          </div>
          {authError && <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">{authError}</div>}
          <button onClick={connectSpotify}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >Connecter avec Spotify</button>
        </motion.div>
      </div>
    );
  }

  const displayList = hasSearched ? results : recommendations;

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Fullscreen ── */}
      <AnimatePresence>
        {isFullScreen && currentTrack && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0d1a] via-[#111122] to-black overflow-auto"
          >
            <button onClick={() => setIsFullScreen(false)}
              className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="h-4 w-4" /> Réduire
            </button>
            <div className="flex flex-col lg:flex-row items-center gap-12 px-8 py-16 max-w-5xl w-full">
              {currentTrack.album?.images?.[0]?.url && (
                <motion.img key={currentTrack.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  src={currentTrack.album.images[0].url} alt="Album"
                  className="h-72 w-72 rounded-2xl shadow-[0_0_100px_rgba(29,185,84,0.4)] shrink-0"
                />
              )}
              <div className="flex flex-col gap-5 flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-3xl font-bold text-white truncate">{currentTrack.name}</p>
                    <p className="text-gray-400 mt-1 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                  </div>
                  <button onClick={() => toggleLike(currentTrack.id)} className={`shrink-0 hover:scale-110 transition-all ${likedIds.has(currentTrack.id) ? "text-[#1DB954]" : "text-gray-500 hover:text-white"}`}>
                    <Heart className={`h-7 w-7 ${likedIds.has(currentTrack.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div>
                  <input type="range" min={0} max={duration || 1} value={seekDragging ? seekValue : progress}
                    onChange={(e) => { setSeekDragging(true); setSeekValue(+e.target.value); }}
                    onMouseUp={(e) => { setSeekDragging(false); seekTo(+(e.target as HTMLInputElement).value); }}
                    onTouchEnd={(e) => { setSeekDragging(false); seekTo(+(e.target as HTMLInputElement).value); }}
                    className="w-full accent-[#1DB954] cursor-pointer" style={{ height: "4px" }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatMs(seekDragging ? seekValue : progress)}</span>
                    <span>{formatMs(duration)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <button onClick={toggleShuffle} className={shuffle ? "text-[#1DB954]" : "text-gray-500 hover:text-white transition-colors"}><Shuffle className="h-5 w-5" /></button>
                  <button onClick={skipPrev} className="text-white hover:scale-110 transition-all"><SkipBack className="h-9 w-9" /></button>
                  <button onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white hover:scale-105 transition-transform shadow-lg"
                  >{isPlaying ? <Pause className="h-7 w-7 text-black" /> : <Play className="h-7 w-7 text-black ml-1" />}</button>
                  <button onClick={skipNext} className="text-white hover:scale-110 transition-all"><SkipForward className="h-9 w-9" /></button>
                  <button onClick={toggleRepeat} className={repeatMode > 0 ? "text-[#1DB954]" : "text-gray-500 hover:text-white transition-colors"}><RepeatIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleMuteToggle} className="text-gray-400 hover:text-white transition-colors"><VolumeIcon className="h-5 w-5" /></button>
                  <input type="range" min={0} max={1} step={0.01} value={volMuted ? 0 : volume}
                    onChange={(e) => { setVolMuted(false); setVolume(+e.target.value); }}
                    className="flex-1 accent-[#1DB954] cursor-pointer"
                  />
                </div>
                {/* Lyrics in fullscreen */}
                {lyrics && (
                  <div className="max-h-48 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{lyrics}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-30 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/30 px-4 py-2 text-sm text-[#1DB954] shadow-lg"
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* ── Lyrics slide panel ── */}
      <AnimatePresence>
        {showLyrics && currentTrack && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLyrics(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-80 flex flex-col border-l border-white/10 bg-[#0a0a14] shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Mic className="h-4 w-4 text-[#1DB954] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{currentTrack.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
                  </div>
                </div>
                <button onClick={() => setShowLyrics(false)} className="shrink-0 ml-2 text-gray-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div ref={lyricsRef} className="flex-1 overflow-y-auto px-5 py-4">
                {lyricsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#1DB954]" /></div>
                ) : lyrics ? (
                  <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">{lyrics}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
                    <Mic className="h-8 w-8 text-gray-700" />
                    <p className="text-sm text-gray-500">Paroles introuvables</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main layout: Now Playing (left) + Discovery (right) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Now Playing panel */}
        <div className="flex flex-col w-72 xl:w-80 shrink-0 border-r border-white/8 bg-gradient-to-b from-[#0a0a14] to-[#050510] p-5 gap-5 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {deviceId ? (
                <span className="flex items-center gap-1.5 text-xs text-[#1DB954] font-medium"><Wifi className="h-3 w-3" /> Connecté</span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><WifiOff className="h-3 w-3" /> Hors ligne</span>
              )}
            </div>
            <button onClick={() => setConfirmDisconnect(true)} className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1">
              <Unlink className="h-3 w-3" />
            </button>
          </div>

          <AnimatePresence>
            {confirmDisconnect && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 shrink-0"
              >
                <p className="text-xs text-red-300 mb-2">Déconnecter Spotify ?</p>
                <div className="flex gap-2">
                  <button onClick={handleDisconnect} className="flex-1 rounded-lg bg-red-500 py-1 text-xs font-bold text-white hover:bg-red-400 transition-colors">Confirmer</button>
                  <button onClick={() => setConfirmDisconnect(false)} className="flex-1 rounded-lg bg-white/10 py-1 text-xs text-white hover:bg-white/20 transition-colors">Annuler</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {needsReauth && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 shrink-0">
              <p className="text-xs text-yellow-300 mb-2 font-medium">Session expirée</p>
              <button onClick={connectSpotify} className="w-full rounded-lg bg-yellow-500 py-1 text-xs font-bold text-black hover:bg-yellow-400 transition-colors">Reconnecter</button>
            </div>
          )}

          {/* Album art */}
          <div className="aspect-square w-full shrink-0 rounded-2xl overflow-hidden bg-white/5 relative">
            <AnimatePresence mode="wait">
              {currentTrack?.album?.images?.[0]?.url ? (
                <motion.img key={currentTrack.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  src={currentTrack.album.images[0].url} alt="Album"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-16 w-16 text-gray-700" />
                </div>
              )}
            </AnimatePresence>
            {currentTrack && (
              <div className="absolute bottom-3 right-3">
                <button onClick={() => setIsFullScreen(true)} className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm">
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Track info + like */}
          <div className="flex items-start gap-2 shrink-0">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.p key={currentTrack?.id || "none"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="font-bold text-white text-base truncate"
                >{currentTrack?.name || "Aucune lecture"}</motion.p>
              </AnimatePresence>
              <p className="text-sm text-gray-400 truncate mt-0.5">
                {currentTrack?.artists?.map((a: any) => a.name).join(", ") || "Lance un titre Spotify"}
              </p>
            </div>
            {currentTrack && (
              <button onClick={() => toggleLike(currentTrack.id)} className={`shrink-0 transition-all hover:scale-110 ${likedIds.has(currentTrack.id) ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}>
                <Heart className={`h-5 w-5 ${likedIds.has(currentTrack.id) ? "fill-current" : ""}`} />
              </button>
            )}
          </div>

          {/* Seek bar */}
          <div className="shrink-0">
            <input type="range" min={0} max={duration || 1} value={seekDragging ? seekValue : progress}
              onChange={(e) => { setSeekDragging(true); setSeekValue(+e.target.value); }}
              onMouseUp={(e) => { setSeekDragging(false); seekTo(+(e.target as HTMLInputElement).value); }}
              onTouchEnd={(e) => { setSeekDragging(false); seekTo(+(e.target as HTMLInputElement).value); }}
              className="w-full accent-[#1DB954] cursor-pointer" style={{ height: "3px" }}
              disabled={!currentTrack}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{formatMs(seekDragging ? seekValue : progress)}</span>
              <span>{formatMs(duration)}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-between shrink-0">
            <button onClick={toggleShuffle} className={`p-2 rounded-full transition-colors ${shuffle ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}>
              <Shuffle className="h-4 w-4" />
            </button>
            <button onClick={skipPrev} className="p-2 text-gray-300 hover:text-white hover:scale-110 transition-all">
              <SkipBack className="h-6 w-6" />
            </button>
            <button onClick={() => isPlaying ? pauseTrack() : handlePlayTrack()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="h-5 w-5 text-black" /> : <Play className="h-5 w-5 text-black ml-0.5" />}
            </button>
            <button onClick={skipNext} className="p-2 text-gray-300 hover:text-white hover:scale-110 transition-all">
              <SkipForward className="h-6 w-6" />
            </button>
            <button onClick={toggleRepeat} className={`p-2 rounded-full transition-colors ${repeatMode > 0 ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}>
              <RepeatIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Volume + extras */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleMuteToggle} className="text-gray-500 hover:text-white transition-colors shrink-0">
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input type="range" min={0} max={1} step={0.01} value={volMuted ? 0 : volume}
              onChange={(e) => { setVolMuted(false); setVolume(+e.target.value); }}
              className="flex-1 accent-[#1DB954] cursor-pointer"
            />
            {/* Lyrics toggle */}
            <button onClick={() => setShowLyrics((v) => !v)} disabled={!currentTrack}
              className={`p-1.5 rounded-full transition-colors shrink-0 ${showLyrics ? "text-[#1DB954] bg-[#1DB954]/10" : "text-gray-600 hover:text-white"}`}
              title="Paroles"
            >
              {showLyrics ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            {/* Device picker */}
            <div className="relative shrink-0" ref={devicesRef}>
              <button onClick={handleOpenDevices}
                className={`p-1.5 rounded-full transition-colors ${showDevices ? "text-[#1DB954] bg-[#1DB954]/10" : "text-gray-600 hover:text-white"}`}
                title="Appareils"
              >
                <MonitorSpeaker className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showDevices && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-white/15 bg-[#1a1a2e] shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-xs font-bold text-white flex items-center gap-2"><MonitorSpeaker className="h-3.5 w-3.5 text-[#1DB954]" /> Appareils</p>
                    </div>
                    {loadingDevices ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
                    ) : devices.length === 0 ? (
                      <p className="px-4 py-4 text-xs text-gray-500 text-center">Aucun appareil actif</p>
                    ) : (
                      <div className="py-1">
                        {devices.map((device) => (
                          <button key={device.id} onClick={() => { transferPlayback(device.id); setShowDevices(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors ${device.is_active ? "text-[#1DB954]" : "text-white"}`}
                          >
                            <DeviceIcon type={device.type} />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-medium truncate">{device.name}</p>
                              <p className="text-xs text-gray-500">{device.type}</p>
                            </div>
                            {device.is_active && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: Discovery + Search */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Tabs + search */}
          <div className="px-5 pt-5 pb-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-lg font-bold text-white">Musique</h1>
              <div className="flex gap-1 rounded-xl bg-white/5 p-1 ml-auto">
                {([["discover", Sparkles, "Découvrir"], ["recent", History, "Récents"]] as const).map(([id, Icon, label]) => (
                  <button key={id} onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeTab === id ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white"}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "discover" && (
              <form onSubmit={searchTracks} className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titre, artiste, album..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-24 text-sm text-white placeholder-gray-600 outline-none focus:border-[#1DB954]/40 focus:bg-white/8 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {hasSearched && (
                    <button type="button" onClick={clearSearch} className="rounded-lg bg-white/10 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors">✕</button>
                  )}
                  <button type="submit" className="rounded-lg bg-[#1DB954] px-3 py-1 text-xs font-bold text-black hover:bg-[#1ed760] transition-colors">Chercher</button>
                </div>
              </form>
            )}
          </div>

          {/* Track list */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {activeTab === "discover" && (
              <>
                {loading || recLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#1DB954]" /></div>
                ) : displayList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    {hasSearched ? <Search className="h-12 w-12 text-gray-800" /> : <Sparkles className="h-12 w-12 text-gray-800" />}
                    <p className="text-gray-500 text-sm">{hasSearched ? "Aucun résultat" : "Lance un titre pour des suggestions"}</p>
                  </div>
                ) : (
                  <>
                    <p className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">
                      {hasSearched ? "Résultats" : currentTrack ? "Recommandés" : "Vos favoris"}
                    </p>
                    {displayList.map((track, i) => (
                      <motion.div key={track.id + i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/6 transition-all cursor-default"
                      >
                        <span className="w-5 text-center text-xs text-gray-600 group-hover:hidden shrink-0">{i + 1}</span>
                        <button onClick={() => handlePlayTrack(track.uri)} className="w-5 hidden group-hover:flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
                          <Play className="h-3.5 w-3.5 text-white" />
                        </button>
                        {track.album?.images?.[0]?.url && (
                          <img src={track.album.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? "text-[#1DB954]" : "text-white"}`}>{track.name}</p>
                          <p className="text-xs text-gray-500 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
                        </div>
                        <span className="text-xs text-gray-700 hidden group-hover:block shrink-0 mr-1">{formatMs(track.duration_ms)}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => toggleLike(track.id)} className={`p-1.5 rounded-full transition-all hover:scale-110 ${likedIds.has(track.id) ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}>
                            <Heart className={`h-3.5 w-3.5 ${likedIds.has(track.id) ? "fill-current" : ""}`} />
                          </button>
                          <button onClick={() => addToPlaylist(track.uri)} className="p-1.5 rounded-full text-gray-600 hover:text-white transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === "recent" && (
              recentlyPlayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <History className="h-12 w-12 text-gray-800" />
                  <p className="text-gray-500 text-sm">Aucun titre récent</p>
                </div>
              ) : (
                <>
                  <p className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">Récemment écoutés</p>
                  {recentlyPlayed.map((item: any, i: number) => {
                    const track = item.track;
                    return (
                      <motion.div key={track.id + i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/6 transition-all cursor-default"
                      >
                        <button onClick={() => handlePlayTrack(track.uri)} className="w-5 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all">
                          <Play className="h-3.5 w-3.5 text-white" />
                        </button>
                        {track.album?.images?.[0]?.url && (
                          <img src={track.album.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${currentTrack?.id === track.id ? "text-[#1DB954]" : "text-white"}`}>{track.name}</p>
                          <p className="text-xs text-gray-500 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => toggleLike(track.id)} className={`p-1.5 rounded-full transition-all ${likedIds.has(track.id) ? "text-[#1DB954]" : "text-gray-600 hover:text-white"}`}>
                            <Heart className={`h-3.5 w-3.5 ${likedIds.has(track.id) ? "fill-current" : ""}`} />
                          </button>
                          <button onClick={() => addToPlaylist(track.uri)} className="p-1.5 rounded-full text-gray-600 hover:text-white transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

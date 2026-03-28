import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { Search, Play, Plus, Music, Copy, Check, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export default function Spotify() {
  const { user, checkAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        const res = await axios.get("/api/spotify/token");
        const token = res.data.token;

        const spotifyPlayer = new window.Spotify.Player({
          name: 'Nexus Dashboard Player',
          getOAuthToken: (cb: any) => { cb(token); },
          volume: 0.5
        });

        setPlayer(spotifyPlayer);

        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        });

        spotifyPlayer.connect();
      } catch (err) {
        console.error("Failed to initialize Spotify Player", err);
      }
    };

    return () => {
      if (player) player.disconnect();
      document.body.removeChild(script);
    };
  }, [user?.hasSpotify, needsReauth]);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;
    const fetchCurrent = async () => {
      try {
        const res = await axios.get("/api/spotify/player/current");
        if (res.data && res.data.item) {
          setCurrentTrack(res.data.item);
          setIsPlaying(res.data.is_playing);
          setNeedsReauth(false);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setNeedsReauth(true);
        } else {
          console.error("Failed to fetch current track", err.response?.data || err.message);
        }
      }
    };
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [user?.hasSpotify, needsReauth]);

  useEffect(() => {
    if (currentTrack && isFullScreen) {
      const fetchLyrics = async () => {
        setLyricsLoading(true);
        try {
          const artist = currentTrack.artists[0].name;
          const title = currentTrack.name.split(" - ")[0]; // Clean up title
          const res = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
          setLyrics(res.data.lyrics || "Lyrics not found.");
        } catch (err) {
          setLyrics("Lyrics not found for this track.");
        } finally {
          setLyricsLoading(false);
        }
      };
      fetchLyrics();
    }
  }, [currentTrack?.id, isFullScreen]);

  const playTrack = async (uri?: string) => {
    try {
      await axios.put("/api/spotify/player/play", {
        uris: uri ? [uri] : undefined,
        device_id: deviceId || undefined
      });
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play", err);
      setActionMessage("Failed to play. Ensure you have an active Spotify device open.");
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  const pauseTrack = async () => {
    try {
      await axios.put("/api/spotify/player/pause");
      setIsPlaying(false);
    } catch (err) {
      console.error("Failed to pause", err);
    }
  };

  const skipNext = async () => {
    try {
      await axios.post("/api/spotify/player/next");
    } catch (err) {
      console.error("Failed to skip", err);
    }
  };

  const skipPrev = async () => {
    try {
      await axios.post("/api/spotify/player/previous");
    } catch (err) {
      console.error("Failed to skip prev", err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") {
        checkAuth();
      } else if (event.data?.type === "SPOTIFY_AUTH_ERROR") {
        setAuthError(event.data.error || "Failed to connect to Spotify. Check your configuration.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkAuth]);

  const connectSpotify = async () => {
    setAuthError("");
    try {
      // Pass the exact frontend redirect URI to the backend
      const redirectUri = `${window.location.origin}/spotify/callback`;
      const res = await axios.get(`/api/spotify/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      window.open(res.data.url, "spotify_auth", "width=600,height=700");
    } catch (err: any) {
      console.error("Failed to get Spotify URL", err);
      setAuthError(err.response?.data?.error || "Failed to connect to Spotify. Check your configuration.");
    }
  };

  const searchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (trackUri: string) => {
    try {
      await axios.post("/api/spotify/playlist/add", { trackUri });
      setActionMessage("Added to Nexus Dashboard playlist!");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      setActionMessage("Failed to add track");
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const copyToClipboard = (text: string, isDev: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDev) {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else {
      setCopiedShared(true);
      setTimeout(() => setCopiedShared(false), 2000);
    }
  };

  if (!user?.hasSpotify) {
    const devUrl = "https://ais-dev-325fscsju67cvd6o46qkhb-385279447335.europe-west2.run.app/spotify/callback";
    const sharedUrl = "https://ais-pre-325fscsju67cvd6o46qkhb-385279447335.europe-west2.run.app/spotify/callback";

    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Music className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-white">Connect Spotify</h2>
          <p className="mb-6 text-gray-400">
            Link your Spotify account to search tracks, manage playlists, and control playback directly from the dashboard.
          </p>

          <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-left text-sm text-yellow-200">
            <p className="mb-4 font-bold text-yellow-400 text-lg">⚠️ Configuration Required</p>
            <p className="mb-4">
              Spotify is extremely strict about Redirect URIs. You <strong>MUST</strong> add these exact URLs to your Spotify Developer Dashboard under <strong>Redirect URIs</strong>, and don't forget to click <strong>Save</strong> at the bottom of the Spotify page!
            </p>
            
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase text-yellow-500">Dev Environment URL:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-black/50 p-3 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-nowrap">
                    {devUrl}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(devUrl, true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {copiedDev ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase text-yellow-500">Shared Environment URL:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-black/50 p-3 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-nowrap">
                    {sharedUrl}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(sharedUrl, false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {copiedShared ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {authError && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
              {authError}
            </div>
          )}

          <button
            onClick={connectSpotify}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
          >
            Connect with Spotify
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Spotify Integration</h1>
          <p className="text-gray-400">Search and manage your music</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-4 py-2 text-sm text-[#1DB954]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]"></span>
          </span>
          Connected
        </div>
      </div>

      {needsReauth && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6"
        >
          <div>
            <h3 className="text-lg font-bold text-yellow-400">Action Required: Update Permissions</h3>
            <p className="text-sm text-yellow-200 mt-1">
              We've added new player features! Please reconnect your Spotify account to grant the necessary playback permissions.
            </p>
          </div>
          <button
            onClick={connectSpotify}
            className="shrink-0 rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
          >
            Reconnect Spotify
          </button>
        </motion.div>
      )}

      <form onSubmit={searchTracks} className="mb-8 relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks, artists, or albums..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-6 text-white placeholder-gray-500 outline-none backdrop-blur-md transition-all focus:border-[#1DB954] focus:bg-white/10"
        />
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Search
        </button>
      </form>

      {actionMessage && (
        <div className="mb-6 rounded-lg bg-[#1DB954]/10 p-4 text-sm text-[#1DB954] border border-[#1DB954]/20">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="relative h-12 w-12 overflow-hidden rounded-md cursor-pointer"
                  onClick={() => playTrack(track.uri)}
                >
                  <img src={track.album.images[0]?.url} alt={track.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white">{track.name}</h3>
                  <p className="text-sm text-gray-400">{track.artists.map((a: any) => a.name).join(", ")}</p>
                </div>
              </div>
              <button 
                onClick={() => addToPlaylist(track.uri)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                title="Add to Nexus Playlist"
              >
                <Plus className="h-5 w-5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Player Bar */}
      {currentTrack && !isFullScreen && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/80 p-4 backdrop-blur-xl md:left-64"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4 w-1/3">
              <img src={currentTrack.album.images[0]?.url} alt="Album Art" className="h-14 w-14 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
              <div className="overflow-hidden">
                <h4 className="truncate font-bold text-white">{currentTrack.name}</h4>
                <p className="truncate text-sm text-gray-400">{currentTrack.artists.map((a: any) => a.name).join(", ")}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-1/3 gap-2">
              <div className="flex items-center gap-6">
                <button onClick={skipPrev} className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>
                <button 
                  onClick={() => isPlaying ? pauseTrack() : playTrack()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-black hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
                </button>
                <button onClick={skipNext} className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end w-1/3">
              <button 
                onClick={() => setIsFullScreen(true)}
                className="text-gray-400 hover:text-emerald-400 transition-colors"
                title="Grand Écran"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grand Écran (Full Screen Mode) */}
      <AnimatePresence>
        {isFullScreen && currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-3xl overflow-hidden"
          >
            {/* Background Blur */}
            <div 
              className="absolute inset-0 opacity-20 blur-[100px] scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${currentTrack.album.images[0]?.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            <div className="relative z-10 flex items-center justify-between p-8">
              <button 
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
                Quitter le grand écran
              </button>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-center gap-16 px-16 pb-24">
              {/* Left: Album Art & Controls */}
              <div className="flex flex-col items-center w-1/2 max-w-md">
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  src={currentTrack.album.images[0]?.url} 
                  alt="Album Art" 
                  className="w-full aspect-square rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] mb-8" 
                />
                <div className="text-center mb-8 w-full">
                  <h2 className="text-4xl font-black text-white mb-2 truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentTrack.name}</h2>
                  <p className="text-xl text-emerald-400 truncate">{currentTrack.artists.map((a: any) => a.name).join(", ")}</p>
                </div>
                
                <div className="flex items-center gap-8">
                  <button onClick={skipPrev} className="text-gray-400 hover:text-emerald-400 transition-colors">
                    <SkipBack className="h-8 w-8 fill-current" />
                  </button>
                  <button 
                    onClick={() => isPlaying ? pauseTrack() : playTrack()}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-black hover:scale-105 hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-2" />}
                  </button>
                  <button onClick={skipNext} className="text-gray-400 hover:text-emerald-400 transition-colors">
                    <SkipForward className="h-8 w-8 fill-current" />
                  </button>
                </div>
              </div>

              {/* Right: Lyrics */}
              <div className="w-1/2 h-full max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                <h3 className="text-2xl font-bold text-emerald-400 mb-6 sticky top-0 bg-black/20 backdrop-blur-md py-4 z-10">Lyrics</h3>
                {lyricsLoading ? (
                  <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-4 bg-emerald-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-1/2"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-5/6"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-2/3"></div>
                  </div>
                ) : (
                  <div className="text-2xl leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">
                    {lyrics}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

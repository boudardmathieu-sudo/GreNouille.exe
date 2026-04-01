import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

type SpotifyContextType = {
  player: any;
  deviceId: string | null;
  currentTrack: any;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeatMode: number;
  needsReauth: boolean;
  setVolume: (v: number) => Promise<void>;
  playTrack: (uri?: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrev: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => Promise<void>;
  disconnectSpotify: () => Promise<void>;
  reconnect: () => void;
};

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [needsReauth, setNeedsReauth] = useState(false);

  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  // When SDK is active and providing state, we slow down polling significantly
  const sdkActiveRef = useRef(false);

  const initPlayer = useCallback(async () => {
    if (playerRef.current) return;
    try {
      const res = await axios.get("/api/spotify/token");
      const token = res.data.token;
      if (!token) return;

      const spotifyPlayer = new window.Spotify.Player({
        name: "Nexus Dashboard Player",
        getOAuthToken: async (cb: (t: string) => void) => {
          try {
            const fresh = await axios.get("/api/spotify/token");
            cb(fresh.data.token || token);
          } catch {
            cb(token);
          }
        },
        volume: 0.5,
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        deviceIdRef.current = device_id;
        setDeviceId(device_id);
        sdkActiveRef.current = true;
      });

      spotifyPlayer.addListener("not_ready", () => {
        deviceIdRef.current = null;
        setDeviceId(null);
        sdkActiveRef.current = false;
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setShuffle(state.shuffle);
        setRepeatMode(state.repeat_mode);
      });

      spotifyPlayer.addListener("authentication_error", () => {
        setNeedsReauth(true);
      });

      spotifyPlayer.addListener("initialization_error", (e: any) => {
        console.error("[Spotify SDK] Init error:", e.message);
      });

      spotifyPlayer.addListener("playback_error", (e: any) => {
        console.error("[Spotify SDK] Playback error:", e.message);
      });

      await spotifyPlayer.connect();
    } catch (err) {
      console.error("[Spotify] Failed to initialize player:", err);
    }
  }, []);

  // Load and init the SDK once
  useEffect(() => {
    if (!user?.hasSpotify || needsReauth || initializedRef.current) return;
    initializedRef.current = true;

    if (window.Spotify) {
      initPlayer();
      return;
    }

    if (document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = initPlayer;
  }, [user?.hasSpotify, needsReauth, initPlayer]);

  // Polling — only runs when SDK is NOT active, to show current state without the SDK
  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;

    const fetchCurrent = async () => {
      // If SDK is active and providing updates, skip REST polling
      if (sdkActiveRef.current) return;
      try {
        const res = await axios.get("/api/spotify/player/current");
        if (res.data?.item) {
          setCurrentTrack(res.data.item);
          setIsPlaying(res.data.is_playing);
          setShuffle(res.data.shuffle_state ?? false);
          setRepeatMode(
            res.data.repeat_state === "track" ? 2
            : res.data.repeat_state === "context" ? 1 : 0
          );
          setNeedsReauth(false);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setNeedsReauth(true);
        }
      }
    };

    fetchCurrent();
    // Poll every 8s only when SDK not active
    const interval = setInterval(fetchCurrent, 8000);
    return () => clearInterval(interval);
  }, [user?.hasSpotify, needsReauth]);

  const setVolume = async (v: number) => {
    setVolumeState(v);
    if (playerRef.current) {
      await playerRef.current.setVolume(v).catch(() => {});
    } else {
      await axios.put(`/api/spotify/player/volume?volume_percent=${Math.round(v * 100)}`).catch(() => {});
    }
  };

  const playTrack = async (uri?: string) => {
    const dId = deviceIdRef.current;
    await axios.put("/api/spotify/player/play", {
      uris: uri ? [uri] : undefined,
      device_id: dId || undefined,
    });
    setIsPlaying(true);
    // Refresh state via SDK after a short delay
    if (playerRef.current) {
      setTimeout(async () => {
        const state = await playerRef.current?.getCurrentState();
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        }
      }, 800);
    }
  };

  const pauseTrack = async () => {
    if (playerRef.current) {
      await playerRef.current.pause().catch(() => {});
    } else {
      await axios.put("/api/spotify/player/pause");
    }
    setIsPlaying(false);
  };

  const skipNext = async () => {
    if (playerRef.current) {
      await playerRef.current.nextTrack().catch(() => {});
    } else {
      await axios.post("/api/spotify/player/next");
    }
  };

  const skipPrev = async () => {
    if (playerRef.current) {
      await playerRef.current.previousTrack().catch(() => {});
    } else {
      await axios.post("/api/spotify/player/previous");
    }
  };

  const toggleShuffle = async () => {
    const next = !shuffle;
    await axios.put(`/api/spotify/player/shuffle?state=${next}`);
    setShuffle(next);
  };

  const toggleRepeat = async () => {
    const modes = ["off", "context", "track"];
    const next = (repeatMode + 1) % 3;
    await axios.put(`/api/spotify/player/repeat?state=${modes[next]}`);
    setRepeatMode(next);
  };

  const disconnectSpotify = async () => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }
    sdkActiveRef.current = false;
    deviceIdRef.current = null;
    setPlayer(null);
    setDeviceId(null);
    setCurrentTrack(null);
    setIsPlaying(false);
    initializedRef.current = false;
    await axios.post("/api/spotify/disconnect").catch(() => {});
  };

  const reconnect = () => {
    setNeedsReauth(false);
    initializedRef.current = false;
    sdkActiveRef.current = false;
  };

  return (
    <SpotifyContext.Provider
      value={{
        player, deviceId, currentTrack, isPlaying, volume, shuffle, repeatMode, needsReauth,
        setVolume, playTrack, pauseTrack, skipNext, skipPrev,
        toggleShuffle, toggleRepeat, disconnectSpotify, reconnect,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used within SpotifyProvider");
  return ctx;
}

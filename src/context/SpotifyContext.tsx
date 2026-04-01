import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const initializedRef = useRef(false);

  const initPlayer = async () => {
    if (playerRef.current) return;
    try {
      const res = await axios.get("/api/spotify/token");
      const token = res.data.token;

      const spotifyPlayer = new window.Spotify.Player({
        name: "Nexus Dashboard Player",
        getOAuthToken: async (cb: any) => {
          try {
            const fresh = await axios.get("/api/spotify/token");
            cb(fresh.data.token);
          } catch {
            cb(token);
          }
        },
        volume: 0.5,
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener("not_ready", () => {
        setDeviceId(null);
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

      spotifyPlayer.connect();
    } catch (err) {
      console.error("[Spotify] Failed to initialize player", err);
    }
  };

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth || initializedRef.current) return;
    initializedRef.current = true;

    if (window.Spotify) {
      initPlayer();
      return;
    }

    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = initPlayer;
  }, [user?.hasSpotify, needsReauth]);

  useEffect(() => {
    if (!user?.hasSpotify || needsReauth) return;
    const fetchCurrent = async () => {
      try {
        const res = await axios.get("/api/spotify/player/current");
        if (res.data?.item) {
          setCurrentTrack(res.data.item);
          setIsPlaying(res.data.is_playing);
          setShuffle(res.data.shuffle_state ?? shuffle);
          setRepeatMode(res.data.repeat_state === "track" ? 2 : res.data.repeat_state === "context" ? 1 : 0);
          setNeedsReauth(false);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setNeedsReauth(true);
        }
      }
    };
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 5000);
    return () => clearInterval(interval);
  }, [user?.hasSpotify, needsReauth]);

  const setVolume = async (v: number) => {
    setVolumeState(v);
    if (playerRef.current) {
      await playerRef.current.setVolume(v).catch(() => {});
    }
  };

  const playTrack = async (uri?: string) => {
    await axios.put("/api/spotify/player/play", {
      uris: uri ? [uri] : undefined,
      device_id: deviceId || undefined,
    });
    setIsPlaying(true);
  };

  const pauseTrack = async () => {
    await axios.put("/api/spotify/player/pause");
    setIsPlaying(false);
  };

  const skipNext = async () => {
    await axios.post("/api/spotify/player/next");
  };

  const skipPrev = async () => {
    await axios.post("/api/spotify/player/previous");
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

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Send, Plus, Trash2, Volume2, VolumeX, MessageSquare, Loader2, X } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = { id: number; role: "user" | "assistant"; content: string; createdAt: string };
type Session = { id: string; title: string; createdAt: string; updatedAt: string };

function NexusOrb({ isSpeaking, isListening, isThinking }: { isSpeaking: boolean; isListening: boolean; isThinking: boolean }) {
  const active = isSpeaking || isListening || isThinking;
  const rings = [
    { size: 320, duration: 8, delay: 0, opacity: 0.06 },
    { size: 260, duration: 6, delay: 0.5, opacity: 0.09 },
    { size: 200, duration: 4, delay: 1, opacity: 0.12 },
    { size: 150, duration: 3, delay: 0.2, opacity: 0.15 },
    { size: 110, duration: 2.5, delay: 0.8, opacity: 0.2 },
  ];

  const coreColor = isListening
    ? "rgba(239,68,68,0.9)"
    : isSpeaking
    ? "rgba(99,102,241,0.9)"
    : isThinking
    ? "rgba(234,179,8,0.9)"
    : "rgba(79,110,247,0.7)";

  const glowColor = isListening
    ? "rgba(239,68,68,0.4)"
    : isSpeaking
    ? "rgba(99,102,241,0.5)"
    : isThinking
    ? "rgba(234,179,8,0.4)"
    : "rgba(79,110,247,0.3)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
      {rings.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-indigo-400/20"
          style={{ width: ring.size, height: ring.size }}
          animate={
            active
              ? {
                  scale: [1, 1.08 + i * 0.02, 0.96, 1.06 + i * 0.01, 1],
                  rotate: i % 2 === 0 ? [0, 360] : [0, -360],
                  borderColor: [
                    `rgba(79,110,247,${ring.opacity})`,
                    `rgba(124,58,237,${ring.opacity * 2})`,
                    `rgba(79,110,247,${ring.opacity})`,
                  ],
                }
              : {
                  scale: 1,
                  rotate: i % 2 === 0 ? [0, 360] : [0, -360],
                  borderColor: `rgba(79,110,247,${ring.opacity})`,
                }
          }
          transition={
            active
              ? { duration: ring.duration * 0.6, delay: ring.delay, repeat: Infinity, ease: "easeInOut" }
              : { duration: ring.duration * 1.8, delay: ring.delay, repeat: Infinity, ease: "linear" }
          }
        />
      ))}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 80,
          height: 80,
          background: `radial-gradient(circle at 35% 35%, rgba(120,150,255,0.95), ${coreColor})`,
          boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}, 0 0 20px rgba(255,255,255,0.15) inset`,
        }}
        animate={
          active
            ? {
                scale: [1, 1.18, 0.92, 1.14, 1],
                boxShadow: [
                  `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
                  `0 0 100px ${glowColor}, 0 0 200px ${glowColor}`,
                  `0 0 60px ${glowColor}, 0 0 120px ${glowColor}`,
                ],
              }
            : { scale: [1, 1.04, 1] }
        }
        transition={
          active
            ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = active ? 55 + Math.random() * 10 : 50;
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: isListening ? "rgba(239,68,68,0.8)" : "rgba(99,102,241,0.8)",
            }}
            animate={
              active
                ? {
                    x: [Math.cos(angle) * radius, Math.cos(angle + 0.5) * (radius + 15), Math.cos(angle) * radius],
                    y: [Math.sin(angle) * radius, Math.sin(angle + 0.5) * (radius + 15), Math.sin(angle) * radius],
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.5, 1],
                  }
                : {
                    x: Math.cos(angle) * 48,
                    y: Math.sin(angle) * 48,
                    opacity: 0.3,
                  }
            }
            transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
          />
        );
      })}
    </div>
  );
}

function SubtitleTicker({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        key={text}
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{ duration: Math.max(8, text.length * 0.07), ease: "linear" }}
        className="inline-block text-sm text-indigo-300/70 font-light tracking-wide"
      >
        {text}
      </motion.div>
    </div>
  );
}

export default function AI() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastReply, setLastReply] = useState("");
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadSessions = useCallback(async () => {
    try {
      const res = await axios.get("/api/ai/sessions");
      setSessions(res.data);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/ai/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch {}
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    if (currentSessionId) loadMessages(currentSessionId);
    else setMessages([]);
  }, [currentSessionId, loadMessages]);

  const createSession = async () => {
    try {
      const res = await axios.post("/api/ai/sessions");
      setSessions((prev) => [res.data, ...prev]);
      setCurrentSessionId(res.data.id);
      setMessages([]);
    } catch {}
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/ai/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === id) { setCurrentSessionId(null); setMessages([]); }
    } catch {}
  };

  const speak = useCallback((text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      const id = uuidv4();
      sessionId = id;
      setCurrentSessionId(id);
    }

    setInput("");
    setLoading(true);
    const userMsg: Message = { id: Date.now(), role: "user", content: msg, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post(`/api/ai/sessions/${sessionId}/chat`, { message: msg });
      const reply = res.data.reply;
      const aiMsg: Message = { id: Date.now() + 1, role: "assistant", content: reply, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      setLastReply(reply);
      speak(reply);
      loadSessions();
    } catch {
      const errMsg: Message = { id: Date.now() + 1, role: "assistant", content: "Erreur de connexion. Réessayez.", createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("La reconnaissance vocale n'est pas supportée dans ce navigateur."); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }

    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setTranscript("");
        setInput(t);
        setIsListening(false);
        sendMessage(t);
      }
    };
    recognition.onerror = () => { setIsListening(false); setTranscript(""); };
    recognition.onend = () => { setIsListening(false); setTranscript(""); };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleMute = () => {
    if (!isMuted && isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    setIsMuted((m) => !m);
  };

  const isThinking = loading;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#02020a" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(79,110,247,0.07), transparent), radial-gradient(ellipse 40% 60% at 80% 20%, rgba(124,58,237,0.05), transparent)",
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-between py-8 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <span className="text-xs font-black text-indigo-300">N</span>
          </div>
          <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase">Nexus AI</span>
          <button
            onClick={toggleMute}
            className="ml-4 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {isMuted ? "Son désactivé" : "Son activé"}
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <NexusOrb isSpeaking={isSpeaking} isListening={isListening} isThinking={isThinking} />

          <AnimatePresence mode="wait">
            {isListening && (
              <motion.p key="listening" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm text-red-400 font-medium tracking-wide">
                {transcript || "En écoute..."}
              </motion.p>
            )}
            {isThinking && !isListening && (
              <motion.p key="thinking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-yellow-400/80 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                NEXUS traite votre requête...
              </motion.p>
            )}
            {isSpeaking && !isListening && !isThinking && (
              <motion.p key="speaking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm text-indigo-400/80 font-medium tracking-wide">
                En cours de réponse...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-2xl space-y-3">
          <div className="h-40 overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-700">Commencez une conversation avec NEXUS</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600/30 border border-indigo-500/30 text-indigo-100"
                          : "bg-white/5 border border-white/10 text-gray-300"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all ${
                isListening
                  ? "border-red-500/50 bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-indigo-400"
              }`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Parlez à NEXUS..."
              disabled={loading || isListening}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder-gray-600 outline-none backdrop-blur transition-all focus:border-indigo-500/40 focus:bg-white/8 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 transition-all hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(79,110,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>

      <div className="relative flex w-72 shrink-0 flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            Conversations
          </div>
          <button
            onClick={createSession}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-gray-700 mb-2" />
              <p className="text-xs text-gray-600">Aucune conversation</p>
              <button onClick={createSession} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                + Nouvelle
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group relative mx-2 mb-1 rounded-xl px-3 py-2.5 transition-all ${
                  currentSessionId === session.id
                    ? "bg-indigo-500/15 border border-indigo-500/25"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <p className={`text-sm truncate font-medium ${currentSessionId === session.id ? "text-indigo-200" : "text-gray-400"}`}>
                  {session.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {new Date(session.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </p>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Dernière réponse</p>
            <div className="h-10 flex items-center">
              <SubtitleTicker text={lastReply} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

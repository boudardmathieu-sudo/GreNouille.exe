import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays, Plus, Trash2, Check, ChevronLeft, ChevronRight,
  Circle, Clock, Flag, Tag, Sparkles,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  tag: string;
  time: string; // HH:MM or ""
  createdAt: number;
}

type Priority = "low" | "medium" | "high";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE = "nexus-agenda-tasks";

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function load(): Task[] {
  try { return JSON.parse(localStorage.getItem(STORAGE) || "[]"); }
  catch { return []; }
}
function save(t: Task[]) { localStorage.setItem(STORAGE, JSON.stringify(t)); }

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const PRIORITY_CFG: Record<Priority, { label: string; color: string; dot: string; border: string; bg: string }> = {
  low:    { label: "Faible",  color: "text-sky-400",    dot: "bg-sky-400",    border: "border-sky-500/40",    bg: "bg-sky-500/10"   },
  medium: { label: "Moyen",   color: "text-amber-400",  dot: "bg-amber-400",  border: "border-amber-500/40",  bg: "bg-amber-500/10" },
  high:   { label: "Urgent",  color: "text-rose-400",   dot: "bg-rose-400",   border: "border-rose-500/40",   bg: "bg-rose-500/10"  },
};

const TAGS = ["Perso", "Travail", "Sport", "Santé", "Étude", "Projet"];

const TAG_COLORS: Record<string, string> = {
  Perso: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Travail: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Sport: "bg-green-500/20 text-green-300 border-green-500/30",
  Santé: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Étude: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Projet: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

// ── Form ──────────────────────────────────────────────────────────────────────

function AddTaskForm({
  date,
  onAdd,
  onClose,
}: {
  date: string;
  onAdd: (t: Task) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tag, setTag] = useState("Perso");
  const [time, setTime] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date,
      text: text.trim(),
      done: false,
      priority,
      tag,
      time,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 p-4 mb-4"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <p className="text-xs font-semibold text-gray-400 mb-3 tracking-wider uppercase">Nouvelle tâche</p>

      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
        placeholder="Description de la tâche…"
        className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 mb-3"
      />

      <div className="flex flex-wrap gap-2 mb-3">
        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5 text-gray-500" />
          <div className="flex gap-1">
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${priority === p ? `${PRIORITY_CFG[p].bg} ${PRIORITY_CFG[p].border} ${PRIORITY_CFG[p].color}` : "bg-white/5 border-white/8 text-gray-500 hover:border-white/15"}`}
              >
                {PRIORITY_CFG[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mb-4">
        <Tag className="h-3.5 w-3.5 text-gray-500 shrink-0" />
        <div className="flex flex-wrap gap-1">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${tag === t ? (TAG_COLORS[t] || "bg-white/10 text-white border-white/20") : "bg-transparent text-gray-600 border-white/8 hover:text-gray-400"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={submit}
          className="flex-1 rounded-xl py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Ajouter
        </button>
        <button
          onClick={onClose}
          className="px-4 rounded-xl py-2 text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
        >
          Annuler
        </button>
      </div>
    </motion.div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const p = PRIORITY_CFG[task.priority];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all group ${task.done ? "opacity-45" : ""} ${p.border} ${p.bg}`}
    >
      <button
        onClick={onToggle}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? "bg-emerald-500 border-emerald-500" : `border-current ${p.color} hover:opacity-80`}`}
      >
        {task.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.done ? "line-through text-gray-500" : "text-white"}`}>
          {task.text}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.time && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="h-2.5 w-2.5" />{task.time}
            </span>
          )}
          {task.tag && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${TAG_COLORS[task.tag] || "bg-white/10 text-gray-400 border-white/15"}`}>
              {task.tag}
            </span>
          )}
          <span className={`text-[9px] font-semibold ${p.color}`}>{p.label}</span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Agenda() {
  const today = new Date();
  const [tasks, setTasks] = useState<Task[]>(load);
  const [selected, setSelected] = useState(fmt(today));
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [adding, setAdding] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => { save(tasks); }, [tasks]);

  const addTask = (t: Task) => setTasks((p) => [...p, t]);
  const toggle = (id: string) => setTasks((p) => p.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  // Calendar cells
  const firstDay = (new Date(curYear, curMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const cells: (number | null)[] = Array.from(
    { length: firstDay + daysInMonth },
    (_, i) => (i < firstDay ? null : i - firstDay + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const taskCountForDay = (d: number) => {
    const key = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return tasks.filter((t) => t.date === key).length;
  };

  const prevMonth = () => {
    if (curMonth === 0) { setCurMonth(11); setCurYear((y) => y - 1); }
    else setCurMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (curMonth === 11) { setCurMonth(0); setCurYear((y) => y + 1); }
    else setCurMonth((m) => m + 1);
  };
  const selectDay = (d: number) => {
    setSelected(`${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setAdding(false);
  };

  const dayTasks = tasks
    .filter((t) => t.date === selected && (!filterTag || t.tag === filterTag))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pa = ["high", "medium", "low"].indexOf(a.priority);
      const pb = ["high", "medium", "low"].indexOf(b.priority);
      return pa - pb;
    });

  const donePct = dayTasks.length > 0 ? Math.round((dayTasks.filter((t) => t.done).length / dayTasks.length) * 100) : 0;

  const selParsed = new Date(selected + "T12:00:00");
  const selLabel = selParsed.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Agenda</h1>
          <p className="text-xs text-gray-500">Planification & tâches quotidiennes</p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Calendar ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="lg:w-80 shrink-0 rounded-3xl border border-white/8 p-5"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/8 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold text-white capitalize">
              {MONTHS_FR[curMonth]} {curYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/8 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map((d, i) => (
              <div key={i} className="text-[10px] text-gray-600 text-center font-semibold py-1 tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const key = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isToday = key === fmt(today);
              const isSel = key === selected;
              const count = taskCountForDay(d);
              return (
                <button
                  key={key}
                  onClick={() => selectDay(d)}
                  className={`relative flex flex-col items-center justify-center h-9 rounded-xl text-xs font-semibold transition-all ${
                    isSel
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : isToday
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                      : "text-gray-400 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {d}
                  {count > 0 && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${isSel ? "bg-indigo-200" : "bg-indigo-400"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini stats */}
          <div className="mt-5 pt-4 border-t border-white/8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/4 border border-white/8 p-3 text-center">
              <p className="text-xl font-black text-white">{tasks.filter((t) => t.date === fmt(today)).length}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Aujourd'hui</p>
            </div>
            <div className="rounded-2xl bg-white/4 border border-white/8 p-3 text-center">
              <p className="text-xl font-black text-white">{tasks.filter((t) => !t.done).length}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">En attente</p>
            </div>
          </div>
        </motion.div>

        {/* ── Task panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex-1 rounded-3xl border border-white/8 p-5 flex flex-col min-h-[520px]"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white capitalize">{selLabel}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {dayTasks.length === 0
                  ? "Aucune tâche"
                  : `${dayTasks.filter((t) => !t.done).length} restante${dayTasks.filter((t) => !t.done).length !== 1 ? "s" : ""} · ${donePct}% complété`}
              </p>
            </div>
            <button
              onClick={() => { setAdding((a) => !a); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                adding
                  ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                  : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {adding ? "Fermer" : "Ajouter"}
            </button>
          </div>

          {/* Progress bar */}
          {dayTasks.length > 0 && (
            <div className="mb-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                animate={{ width: `${donePct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Tag filter */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${filterTag === null ? "bg-white/12 border-white/20 text-white" : "bg-transparent border-white/8 text-gray-600 hover:text-gray-400"}`}
            >
              Tous
            </button>
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setFilterTag(filterTag === t ? null : t)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${filterTag === t ? (TAG_COLORS[t] || "bg-white/10 text-white border-white/20") : "bg-transparent border-white/8 text-gray-600 hover:text-gray-400"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Add form */}
          <AnimatePresence>
            {adding && (
              <AddTaskForm date={selected} onAdd={addTask} onClose={() => setAdding(false)} />
            )}
          </AnimatePresence>

          {/* Task list */}
          <div className="flex flex-col gap-2 flex-1">
            <AnimatePresence mode="popLayout">
              {dayTasks.length === 0 && !adding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 gap-3 py-12"
                >
                  <div className="h-16 w-16 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500">Journée libre !</p>
                  <p className="text-xs text-gray-600">Clique sur "Ajouter" pour planifier</p>
                </motion.div>
              )}
              {dayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggle(task.id)}
                  onDelete={() => remove(task.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

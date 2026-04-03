import { Router } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const QUOTES = [
  { quote: "Je pense donc je suis.", author: "René Descartes", category: "Philosophe", answer: "descartes" },
  { quote: "La vie est courte, l'art est long, l'occasion fugitive, l'expérience trompeuse, le jugement difficile.", author: "Hippocrate", category: "Philosophe", answer: "hippocrate" },
  { quote: "Être ou ne pas être, telle est la question.", author: "Shakespeare — Hamlet", category: "Littérature", answer: "hamlet" },
  { quote: "Il vaut mieux avoir essayé et échoué que de ne jamais avoir essayé.", author: "Theodore Roosevelt", category: "Citation", answer: "roosevelt" },
  { quote: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.", author: "Antoine de Saint-Exupéry — Le Petit Prince", category: "Littérature", answer: "petit prince" },
  { quote: "La où une porte se ferme, une fenêtre s'ouvre.", author: "Cervantes — Don Quichotte", category: "Littérature", answer: "don quichotte" },
  { quote: "Ne regarde pas seulement avec tes yeux, regarde avec tout ton cœur.", author: "Fullmetal Alchemist", category: "Anime", answer: "fullmetal alchemist" },
  { quote: "Les rêves donnent du travail.", author: "Haikyuu!!", category: "Anime", answer: "haikyuu" },
  { quote: "Travailler dur n'est pas suffisant, il faut aussi travailler intelligemment.", author: "Naruto Uzumaki — Naruto", category: "Anime", answer: "naruto" },
  { quote: "Si tu portes le poids du passé, tu ne pourras jamais avancer.", author: "Itachi Uchiha — Naruto", category: "Anime", answer: "itachi" },
  { quote: "La peur est le chemin vers le côté obscur.", author: "Yoda — Star Wars", category: "Film", answer: "star wars" },
  { quote: "Avec de grands pouvoirs viennent de grandes responsabilités.", author: "Spider-Man", category: "Film", answer: "spider-man" },
  { quote: "Pourquoi tombons-nous ? Pour apprendre à nous relever.", author: "Alfred — Batman Begins", category: "Film", answer: "batman" },
  { quote: "Tu ne peux pas changer ton passé, mais tu peux nettoyer ta conscience si tu avances avec sincérité.", author: "Kenshin — Samurai X", category: "Anime", answer: "samurai x" },
  { quote: "La réalité est douloureuse. C'est pourquoi les gens cherchent le rêve.", author: "Pain — Naruto", category: "Anime", answer: "pain" },
  { quote: "Je suis le maître de mon destin, je suis le capitaine de mon âme.", author: "William Ernest Henley — Invictus", category: "Poème", answer: "invictus" },
  { quote: "Sous le ciel tout se fond dans le rien, mais rien ne se perd.", author: "Victor Hugo — Les Misérables", category: "Littérature", answer: "les misérables" },
  { quote: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein", category: "Citation", answer: "einstein" },
  { quote: "La plus perdue de toutes les journées est celle où l'on n'a pas ri.", author: "Nicolas Chamfort", category: "Citation", answer: "chamfort" },
  { quote: "Je n'ai jamais rencontré un homme si ignorant qu'il n'ait rien à m'apprendre.", author: "Galilée", category: "Citation", answer: "galilée" },
  { quote: "Ne juge pas chaque jour à la récolte que tu fais, mais aux graines que tu plantes.", author: "Robert Louis Stevenson", category: "Citation", answer: "stevenson" },
  { quote: "Deux routes divergeaient dans un bois, j'ai pris la moins fréquentée.", author: "Robert Frost — The Road Not Taken", category: "Poème", answer: "robert frost" },
  { quote: "Pour mourir, il faut avoir existé. Alors vivez.", author: "L'Attaque des Titans", category: "Anime", answer: "attack on titan" },
  { quote: "Tout ce qui a une forme finira par disparaître. Mais cela ne signifie pas que c'est sans valeur.", author: "Bleach — Zangetsu", category: "Anime", answer: "bleach" },
  { quote: "La liberté, c'est de choisir ses propres chaînes.", author: "Jean-Paul Sartre", category: "Philosophe", answer: "sartre" },
  { quote: "On ne naît pas femme, on le devient.", author: "Simone de Beauvoir", category: "Citation", answer: "simone de beauvoir" },
  { quote: "L'enfer, c'est les autres.", author: "Jean-Paul Sartre — Huis Clos", category: "Littérature", answer: "huis clos" },
  { quote: "Après tout ce temps ? Toujours.", author: "Severus Rogue — Harry Potter", category: "Film", answer: "harry potter" },
  { quote: "Je suis ton père.", author: "Dark Vador — L'Empire contre-attaque", category: "Film", answer: "empire contre-attaque" },
  { quote: "Ce n'est pas qui je suis en dessous, mais ce que je fais qui me définit.", author: "Batman Begins", category: "Film", answer: "batman begins" },
];

function getTodayChallenge() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

router.get("/today", authenticateToken, (_req, res) => {
  try {
    const c = getTodayChallenge();
    res.json({
      date: getTodayString(),
      quote: c.quote,
      category: c.category,
      hint: c.author.split("—")[0].trim().split(" ").map((w, i) => i === 0 ? w[0] + "*".repeat(w.length - 1) : "*".repeat(w.length)).join(" "),
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/answer", authenticateToken, (req: any, res) => {
  try {
    const { email, answer } = req.body;
    if (!email || !answer) return res.status(400).json({ error: "email et answer requis" });

    const today = getTodayString();
    const existing = db.prepare("SELECT * FROM user_scores WHERE email = ? AND date = ?").get(email, today) as any;
    if (existing?.answered) {
      return res.json({
        alreadyAnswered: true,
        correct: existing.correct === 1,
        correctAnswer: getTodayChallenge().author,
        score: getScore(email),
      });
    }

    const c = getTodayChallenge();
    const normalizeStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
    const isCorrect = normalizeStr(answer).split(/\s+/).some(word =>
      word.length > 2 && normalizeStr(c.answer).includes(word)
    ) || normalizeStr(c.answer).split(/\s+/).some(word =>
      word.length > 2 && normalizeStr(answer).includes(word)
    );

    db.prepare(
      `INSERT INTO user_scores (email, date, correct, answered)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(email, date) DO UPDATE SET correct = excluded.correct, answered = 1`
    ).run(email, today, isCorrect ? 1 : 0);

    res.json({
      correct: isCorrect,
      correctAnswer: c.author,
      score: getScore(email),
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

function getScore(email: string) {
  const rows = db.prepare("SELECT correct, answered FROM user_scores WHERE email = ?").all(email) as any[];
  const correct = rows.filter(r => r.correct === 1).length;
  const total = rows.filter(r => r.answered === 1).length;
  return { correct, total };
}

router.get("/score", authenticateToken, (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "email requis" });
    res.json(getScore(email));
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

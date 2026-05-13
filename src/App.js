// ============================================================
// ESTUDO MÁGICO PRO — App.js
// React + Firebase | 7.º ano Portugal
// ============================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./App.css";

// ─── Firebase Config ──────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyC2HOMgI15hXf-0YhceNWmj9dppl1sXi8s",
  authDomain: "estudo-magico-3276c.firebaseapp.com",
  projectId: "estudo-magico-3276c",
  storageBucket: "estudo-magico-3276c.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000000000",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Static Quiz Data ─────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: "q1",
    subject: "Matemática",
    question: "Qual é o resultado de 7 × 8?",
    options: ["54", "56", "64", "48"],
    correct: 1,
    difficulty: "fácil",
    xp: 10,
  },
  {
    id: "q2",
    subject: "Ciências",
    question: "Qual é a fórmula química da água?",
    options: ["H2O2", "CO2", "H2O", "O2"],
    correct: 2,
    difficulty: "fácil",
    xp: 10,
  },
  {
    id: "q3",
    subject: "História",
    question: "Em que ano foi fundada a nacionalidade portuguesa?",
    options: ["1143", "1415", "1095", "1200"],
    correct: 0,
    difficulty: "médio",
    xp: 20,
  },
  {
    id: "q4",
    subject: "Português",
    question: "Qual é o plural de 'cidadão'?",
    options: ["cidadões", "cidadãos", "cidadões", "cidadãs"],
    correct: 1,
    difficulty: "médio",
    xp: 20,
  },
  {
    id: "q5",
    subject: "Geografia",
    question: "Qual é o rio mais longo de Portugal?",
    options: ["Douro", "Tejo", "Guadiana", "Mondego"],
    correct: 1,
    difficulty: "fácil",
    xp: 10,
  },
  {
    id: "q6",
    subject: "Matemática",
    question: "Quanto é a raiz quadrada de 144?",
    options: ["11", "13", "12", "14"],
    correct: 2,
    difficulty: "médio",
    xp: 20,
  },
  {
    id: "q7",
    subject: "Ciências",
    question: "Quantos ossos tem o corpo humano adulto?",
    options: ["206", "213", "198", "220"],
    correct: 0,
    difficulty: "difícil",
    xp: 30,
  },
  {
    id: "q8",
    subject: "Inglês",
    question: "What is the past tense of 'go'?",
    options: ["goed", "gone", "went", "going"],
    correct: 2,
    difficulty: "fácil",
    xp: 10,
  },
];

const FLASHCARDS = [
  {
    id: "f1",
    subject: "Matemática",
    front: "O que é uma equação do 1.º grau?",
    back: "Uma equação onde a incógnita tem grau máximo 1. Exemplo: 2x + 3 = 7",
  },
  {
    id: "f2",
    subject: "Ciências",
    front: "O que é a fotossíntese?",
    back: "Processo pelo qual as plantas produzem glucose usando luz solar, CO2 e água.",
  },
  {
    id: "f3",
    subject: "História",
    front: "O que foi a Expansão Portuguesa?",
    back: "Período dos séc. XV e XVI em que Portugal explorou rotas marítimas para África, Ásia e América.",
  },
  {
    id: "f4",
    subject: "Português",
    front: "O que é um adjetivo?",
    back: "Palavra que qualifica ou caracteriza o substantivo. Exemplo: belo, rápido, grande.",
  },
  {
    id: "f5",
    subject: "Geografia",
    front: "Quais são os principais rios de Portugal?",
    back: "Tejo (o mais longo), Douro, Minho, Guadiana, Mondego e Sado.",
  },
];

const DEFAULT_MISSIONS = [
  { id: "m1", title: "Responde a 5 perguntas de quiz", xp: 50, type: "quiz", target: 5, icon: "🎯" },
  { id: "m2", title: "Estuda 3 flashcards", xp: 30, type: "flashcard", target: 3, icon: "📚" },
  { id: "m3", title: "Faz login 3 dias seguidos", xp: 100, type: "streak", target: 3, icon: "🔥" },
  { id: "m4", title: "Completa o modo teste", xp: 80, type: "test", target: 1, icon: "⏱️" },
  { id: "m5", title: "Faz 10 perguntas à IA", xp: 40, type: "ai", target: 10, icon: "🤖" },
];

// ─── Error Boundary ───────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(err, info) {
    console.error("ErrorBoundary:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-card glass">
            <span className="error-icon">⚠️</span>
            <h2>Algo correu mal</h2>
            <p>{this.state.error?.message || "Erro desconhecido"}</p>
            <button
              className="btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Skeleton Screen ──────────────────────────────────────
function Skeleton({ width = "100%", height = "1rem", radius = "8px" }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
    />
  );
}

// ─── Stat Bar (topo) ──────────────────────────────────────
function StatBar({ user }) {
  if (!user) {
    return (
      <div className="stat-bar glass">
        <Skeleton width="80px" height="1.5rem" />
        <Skeleton width="80px" height="1.5rem" />
        <Skeleton width="80px" height="1.5rem" />
      </div>
    );
  }
  const levelProgress = ((user.xp % 100) / 100) * 100;
  return (
    <div className="stat-bar glass">
      <div className="stat-item">
        <span className="stat-icon">⭐</span>
        <div className="stat-info">
          <span className="stat-label">XP</span>
          <span className="stat-value">{user.xp}</span>
        </div>
      </div>
      <div className="stat-item">
        <span className="stat-icon">❤️</span>
        <div className="stat-info">
          <span className="stat-label">Vidas</span>
          <span className="stat-value">{user.lives}</span>
        </div>
      </div>
      <div className="stat-item">
        <span className="stat-icon">🔥</span>
        <div className="stat-info">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{user.streak}d</span>
        </div>
      </div>
      <div className="stat-item level-item">
        <span className="stat-icon">🏆</span>
        <div className="stat-info">
          <span className="stat-label">Nível {user.level}</span>
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────
function Dashboard({ user, onNavigate }) {
  const menuItems = [
    { id: "quiz", icon: "🎯", label: "Quiz", sublabel: "Responde e ganha XP", color: "blue" },
    { id: "teste", icon: "⏱️", label: "Modo Teste", sublabel: "Cronómetro ativo", color: "orange" },
    { id: "flashcards", icon: "📚", label: "Revisões", sublabel: "Flashcards interativos", color: "green" },
    { id: "ia", icon: "🤖", label: "Explicação IA", sublabel: "Pergunta à inteligência artificial", color: "purple" },
    { id: "missoes", icon: "📋", label: "Missões", sublabel: "Tarefas diárias", color: "yellow" },
    { id: "ranking", icon: "🏅", label: "Ranking", sublabel: "Top mundial", color: "red" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Olá, <span className="name-highlight">{user?.username || "Estudante"}</span> 👋
        </h1>
        <p className="dashboard-subtitle">O que queres estudar hoje?</p>
      </div>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-card glass card-${item.color}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <div className="menu-text">
              <span className="menu-label">{item.label}</span>
              <span className="menu-sublabel">{item.sublabel}</span>
            </div>
            <span className="menu-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quiz Mode ────────────────────────────────────────────
function QuizMode({ user, onXpGain, onLiveLost, testMode = false }) {
  const [questions] = useState(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    return testMode ? shuffled : shuffled.slice(0, 5);
  });
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(testMode ? 300 : null);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!testMode || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [testMode, finished]);

  const q = questions[current];

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === q.correct;
    const newResults = [...results, { question: q.question, correct, selected: idx, correctIdx: q.correct }];
    setResults(newResults);
    if (correct) {
      setScore((s) => s + q.xp);
      onXpGain(q.xp);
    } else {
      onLiveLost();
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      if (testMode) clearInterval(timerRef.current);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const total = questions.length;
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="quiz-finish glass">
        <span className="finish-icon">{pct >= 70 ? "🎉" : "💪"}</span>
        <h2>{pct >= 70 ? "Excelente trabalho!" : "Continua a tentar!"}</h2>
        <div className="finish-stats">
          <div className="finish-stat">
            <span className="finish-num">{correct}/{total}</span>
            <span className="finish-label">Corretas</span>
          </div>
          <div className="finish-stat">
            <span className="finish-num">{score}</span>
            <span className="finish-label">XP ganho</span>
          </div>
          <div className="finish-stat">
            <span className="finish-num">{pct}%</span>
            <span className="finish-label">Precisão</span>
          </div>
        </div>
        <div className="finish-review">
          {results.map((r, i) => (
            <div key={i} className={`review-item ${r.correct ? "correct" : "wrong"}`}>
              <span>{r.correct ? "✅" : "❌"}</span>
              <span className="review-q">{r.question}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {testMode && (
        <div className={`timer-bar glass ${timeLeft < 60 ? "timer-urgent" : ""}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      )}
      <div className="quiz-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          {current + 1}/{questions.length}
        </span>
      </div>

      <div className="quiz-card glass">
        <div className="quiz-meta">
          <span className="quiz-subject badge">{q.subject}</span>
          <span className={`quiz-diff badge diff-${q.difficulty}`}>{q.difficulty}</span>
          <span className="quiz-xp badge">+{q.xp} XP</span>
        </div>
        <h3 className="quiz-question">{q.question}</h3>
        <div className="quiz-options">
          {q.options.map((opt, idx) => {
            let cls = "option-btn";
            if (answered) {
              if (idx === q.correct) cls += " option-correct";
              else if (idx === selected) cls += " option-wrong";
              else cls += " option-dim";
            }
            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
              >
                <span className="option-letter">
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span className="option-text">{opt}</span>
                {answered && idx === q.correct && <span className="option-check">✓</span>}
                {answered && idx === selected && idx !== q.correct && <span className="option-check">✗</span>}
              </button>
            );
          })}
        </div>
        {answered && (
          <button className="btn-primary next-btn" onClick={handleNext}>
            {current + 1 >= questions.length ? "Ver Resultados" : "Próxima pergunta"} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Flashcards Mode ──────────────────────────────────────
function FlashcardsMode({ onXpGain }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studied, setStudied] = useState(new Set());

  const card = FLASHCARDS[index];
  const progress = (studied.size / FLASHCARDS.length) * 100;

  const handleFlip = () => setFlipped((f) => !f);

  const handleKnew = () => {
    if (!studied.has(index)) {
      setStudied((s) => new Set([...s, index]));
      onXpGain(5);
    }
    next();
  };
  const handleStudyMore = () => next();
  const next = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % FLASHCARDS.length), 150);
  };

  return (
    <div className="flashcards-container">
      <div className="fc-progress-wrap">
        <span className="fc-progress-label">
          {studied.size}/{FLASHCARDS.length} estudados
        </span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className={`flashcard glass ${flipped ? "flipped" : ""}`} onClick={handleFlip}>
        <div className="fc-front">
          <span className="fc-subject badge">{card.subject}</span>
          <p className="fc-text">{card.front}</p>
          <span className="fc-hint">Clica para revelar</span>
        </div>
        <div className="fc-back">
          <span className="fc-icon">💡</span>
          <p className="fc-text">{card.back}</p>
        </div>
      </div>
      {flipped && (
        <div className="fc-actions">
          <button className="btn-success" onClick={handleKnew}>
            ✅ Já sei
          </button>
          <button className="btn-secondary" onClick={handleStudyMore}>
            🔄 Rever
          </button>
        </div>
      )}
      <div className="fc-nav">
        <button
          className="btn-icon"
          onClick={() => { setFlipped(false); setTimeout(() => setIndex((i) => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length), 150); }}
        >
          ‹
        </button>
        <span className="fc-counter">{index + 1} / {FLASHCARDS.length}</span>
        <button className="btn-icon" onClick={next}>›</button>
      </div>
    </div>
  );
}

// ─── AI Explanation Mode ──────────────────────────────────
function IAMode({ onXpGain }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      text: "Olá! Sou o teu assistente de estudo. Podes perguntar-me qualquer dúvida sobre as tuas matérias do 7.º ano. Estou aqui para ajudar! 😊",
    },
  ]);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation]);

  const SIMULATED_RESPONSES = {
    matemática: "A matemática do 7.º ano envolve álgebra, geometria e números racionais. Podes pedir-me para explicar equações, frações, potências ou qualquer outro tópico!",
    história: "Na história do 7.º ano, estudamos a Expansão Portuguesa, os Descobrimentos e o Renascimento. Quer que explique algum período específico?",
    ciências: "Em ciências estudamos o corpo humano, os ecossistemas e a célula. As células são as unidades básicas da vida — têm membrana, citoplasma e núcleo.",
    português: "O português do 7.º ano cobre gramática, textos literários e escrita criativa. Posso ajudar-te com análise de texto, classes de palavras ou produção escrita!",
    default: "Boa pergunta! Para o 7.º ano, este tema é muito importante. Vou tentar explicar de forma simples: o essencial é compreender os conceitos base antes de avançar para os mais complexos. Pratica com exercícios e tudo ficará mais claro!",
  };

  const getResponse = (q) => {
    const lower = q.toLowerCase();
    for (const [key, val] of Object.entries(SIMULATED_RESPONSES)) {
      if (lower.includes(key)) return val;
    }
    return SIMULATED_RESPONSES.default;
  };

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    const userMsg = question.trim();
    setQuestion("");
    setConversation((c) => [...c, { role: "user", text: userMsg }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const response = getResponse(userMsg);
    setConversation((c) => [...c, { role: "assistant", text: response }]);
    setLoading(false);
    onXpGain(3);
  };

  const suggestions = ["Explica equações do 1.º grau", "O que foi a Expansão Portuguesa?", "Como funciona a fotossíntese?", "O que é um adjetivo?"];

  return (
    <div className="ia-container">
      <div className="chat-window glass" ref={chatRef}>
        {conversation.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === "assistant" && <span className="chat-avatar">🤖</span>}
            <div className="chat-bubble">{msg.text}</div>
            {msg.role === "user" && <span className="chat-avatar">👤</span>}
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <span className="chat-avatar">🤖</span>
            <div className="chat-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => setQuestion(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input glass"
          placeholder="Faz uma pergunta sobre qualquer matéria..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          className="btn-send"
          onClick={handleSubmit}
          disabled={!question.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ─── Missions Mode ────────────────────────────────────────
function MissoesMode({ user, onXpGain }) {
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [completed, setCompleted] = useState(new Set());

  const handleComplete = (id, xp) => {
    if (completed.has(id)) return;
    setCompleted((c) => new Set([...c, id]));
    onXpGain(xp);
  };

  const totalXp = missions.reduce((a, m) => a + (completed.has(m.id) ? m.xp : 0), 0);
  const progress = (completed.size / missions.length) * 100;

  return (
    <div className="missoes-container">
      <div className="missoes-header glass">
        <div className="missoes-today">
          <span className="missoes-icon">📋</span>
          <div>
            <p className="missoes-title">Missões de Hoje</p>
            <p className="missoes-sub">
              {completed.size}/{missions.length} completas — {totalXp} XP ganhos
            </p>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: "0.5rem" }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="missions-list">
        {missions.map((m) => {
          const done = completed.has(m.id);
          return (
            <div key={m.id} className={`mission-card glass ${done ? "mission-done" : ""}`}>
              <span className="mission-emoji">{m.icon}</span>
              <div className="mission-info">
                <p className="mission-title">{m.title}</p>
                <p className="mission-xp">+{m.xp} XP</p>
              </div>
              <button
                className={done ? "btn-done" : "btn-primary-sm"}
                onClick={() => handleComplete(m.id, m.xp)}
                disabled={done}
              >
                {done ? "✓ Feito" : "Completar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Leaderboard Mode ─────────────────────────────────────
function RankingMode({ currentUser }) {
  const [leaders, setLeaders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try Firestore; fallback to mock data
    const fetchLeaders = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("xp", "desc"),
          limit(10)
        );
        const snap = await getDocs(q);
        if (snap.empty) throw new Error("empty");
        const data = snap.docs.map((d, i) => ({
          rank: i + 1,
          ...d.data(),
          id: d.id,
        }));
        setLeaders(data);
      } catch {
        // fallback mock
        setLeaders([
          { rank: 1, username: "MathWizard99", xp: 3420, level: 34, streak: 15 },
          { rank: 2, username: "ScienceQueen", xp: 2980, level: 29, streak: 10 },
          { rank: 3, username: "HistoryHero", xp: 2450, level: 24, streak: 7 },
          { rank: 4, username: currentUser?.username || "Tu", xp: currentUser?.xp || 0, level: currentUser?.level || 1, streak: currentUser?.streak || 0, isCurrentUser: true },
          { rank: 5, username: "GeoMaster", xp: 1200, level: 12, streak: 3 },
          { rank: 6, username: "LinguaLion", xp: 980, level: 9, streak: 5 },
          { rank: 7, username: "PortugalPride", xp: 750, level: 7, streak: 2 },
          { rank: 8, username: "MathStar", xp: 620, level: 6, streak: 4 },
          { rank: 9, username: "BioKing", xp: 490, level: 4, streak: 1 },
          { rank: 10, username: "QuizChamp", xp: 300, level: 3, streak: 1 },
        ]);
      }
      setLoading(false);
    };
    fetchLeaders();
  }, [currentUser]);

  const medals = ["🥇", "🥈", "🥉"];

  if (loading) {
    return (
      <div className="ranking-container">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="ranking-skeleton glass">
            <Skeleton width="2rem" height="2rem" radius="50%" />
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="4rem" height="1rem" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-podium">
        {leaders.slice(0, 3).map((l, i) => (
          <div key={l.rank} className={`podium-item podium-${i + 1}`}>
            <span className="podium-medal">{medals[i]}</span>
            <div className="podium-bar glass" style={{ height: `${100 - i * 20}px` }} />
            <span className="podium-name">{l.username}</span>
            <span className="podium-xp">{l.xp} XP</span>
          </div>
        ))}
      </div>
      <div className="ranking-list">
        {leaders.map((l) => (
          <div
            key={l.rank}
            className={`ranking-row glass ${l.isCurrentUser ? "ranking-me" : ""}`}
          >
            <span className="rank-num">
              {l.rank <= 3 ? medals[l.rank - 1] : `#${l.rank}`}
            </span>
            <div className="rank-info">
              <span className="rank-name">{l.username} {l.isCurrentUser ? "(Tu)" : ""}</span>
              <span className="rank-level">Nível {l.level} · 🔥{l.streak}d</span>
            </div>
            <span className="rank-xp">{l.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────
function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examMode, setExamMode] = useState(false);
  const [newMission, setNewMission] = useState({ title: "", xp: 50, icon: "📌" });
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(data.length > 0 ? data : [
          { id: "mock1", username: "MathWizard99", xp: 3420, lives: 5, level: 34 },
          { id: "mock2", username: "ScienceQueen", xp: 2980, lives: 3, level: 29 },
        ]);
      } catch {
        setUsers([
          { id: "mock1", username: "MathWizard99", xp: 3420, lives: 5, level: 34 },
          { id: "mock2", username: "ScienceQueen", xp: 2980, lives: 3, level: 29 },
        ]);
      }
      setLoading(false);
    };
    fetchUsers();
    if (examMode) {
      document.documentElement.style.setProperty("--accent", "#e53935");
      document.documentElement.style.setProperty("--accent-glow", "#e5393544");
    } else {
      document.documentElement.style.setProperty("--accent", "#5c6bc0");
      document.documentElement.style.setProperty("--accent-glow", "#5c6bc044");
    }
  }, [examMode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveUser = async (user) => {
    try {
      await updateDoc(doc(db, "users", user.id), { xp: user.xp, lives: user.lives });
      setUsers((us) => us.map((u) => (u.id === user.id ? user : u)));
      showToast("Utilizador atualizado com sucesso!");
    } catch {
      setUsers((us) => us.map((u) => (u.id === user.id ? user : u)));
      showToast("Guardado localmente (Firebase offline)");
    }
    setEditingUser(null);
  };

  const handleAddMission = () => {
    if (!newMission.title.trim()) return;
    const m = { ...newMission, id: `m_${Date.now()}`, type: "custom", target: 1 };
    setMissions((ms) => [...ms, m]);
    setNewMission({ title: "", xp: 50, icon: "📌" });
    showToast("Missão adicionada!");
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="admin-denied glass">
        <span style={{ fontSize: "3rem" }}>🔒</span>
        <h2>Acesso negado</h2>
        <p>Precisas de permissões de administrador.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {toast && <div className="toast glass">{toast}</div>}

      <div className="admin-header glass">
        <span>🛡️</span>
        <h2>Painel de Administração</h2>
      </div>

      <div className="admin-section glass">
        <h3>🌐 Modo Global</h3>
        <div className="admin-toggle-row">
          <span>Modo Exames (vermelho)</span>
          <button
            className={`toggle-btn ${examMode ? "toggle-on" : ""}`}
            onClick={() => setExamMode((e) => !e)}
          >
            {examMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="admin-section glass">
        <h3>👥 Gerir Utilizadores</h3>
        {loading ? (
          <Skeleton width="100%" height="3rem" />
        ) : (
          <div className="users-list">
            {users.map((u) => (
              <div key={u.id} className="user-row">
                {editingUser?.id === u.id ? (
                  <div className="user-edit">
                    <span className="user-name-edit">{u.username}</span>
                    <label>XP:
                      <input
                        type="number"
                        className="admin-input"
                        value={editingUser.xp}
                        onChange={(e) => setEditingUser({ ...editingUser, xp: Number(e.target.value) })}
                      />
                    </label>
                    <label>Vidas:
                      <input
                        type="number"
                        className="admin-input"
                        min="0"
                        max="10"
                        value={editingUser.lives}
                        onChange={(e) => setEditingUser({ ...editingUser, lives: Number(e.target.value) })}
                      />
                    </label>
                    <button className="btn-primary-sm" onClick={() => handleSaveUser(editingUser)}>Guardar</button>
                    <button className="btn-secondary-sm" onClick={() => setEditingUser(null)}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <span className="user-name">{u.username}</span>
                    <span className="user-stats-admin">{u.xp} XP · {u.lives} ❤️</span>
                    <button className="btn-edit" onClick={() => setEditingUser({ ...u })}>✏️ Editar</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section glass">
        <h3>📋 Adicionar Missão</h3>
        <div className="mission-form">
          <input
            className="admin-input-full"
            placeholder="Título da missão..."
            value={newMission.title}
            onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
          />
          <div className="mission-form-row">
            <label>
              XP:
              <input
                type="number"
                className="admin-input"
                value={newMission.xp}
                onChange={(e) => setNewMission({ ...newMission, xp: Number(e.target.value) })}
              />
            </label>
            <label>
              Ícone:
              <input
                className="admin-input"
                value={newMission.icon}
                onChange={(e) => setNewMission({ ...newMission, icon: e.target.value })}
                style={{ width: "60px" }}
              />
            </label>
            <button className="btn-primary" onClick={handleAddMission}>Adicionar</button>
          </div>
        </div>
        <div className="missions-preview">
          {missions.map((m) => (
            <div key={m.id} className="mission-preview-row">
              <span>{m.icon}</span>
              <span>{m.title}</span>
              <span className="badge">+{m.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Setup Username Modal ─────────────────────────────────
function SetupModal({ onSave }) {
  const [username, setUsername] = useState("");
  const adjectives = ["Sábio", "Rápido", "Brilhante", "Curioso", "Épico"];
  const nouns = ["Estudante", "Scholar", "Génio", "Herói", "Mago"];
  const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 99)}`;
  const [suggested] = useState(randomName);

  return (
    <div className="modal-overlay">
      <div className="modal-card glass">
        <span className="modal-icon">✨</span>
        <h2>Bem-vindo ao Estudo Mágico Pro!</h2>
        <p>Escolhe um nome de utilizador para começar a tua aventura de aprendizagem.</p>
        <input
          className="modal-input"
          placeholder={suggested}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
        />
        <button
          className="btn-primary"
          onClick={() => onSave(username.trim() || suggested)}
          style={{ marginTop: "1rem", width: "100%" }}
        >
          Começar a estudar 🚀
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [showSetup, setShowSetup] = useState(false);
  const unsubRef = useRef(null);

  // Auth init
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Listen to user doc in real time
        unsubRef.current?.();
        unsubRef.current = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setUserData(snap.data());
            setLoading(false);
          } else {
            setShowSetup(true);
            setLoading(false);
          }
        });
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth error:", err);
          // Offline fallback
          setUserData({
            uid: "offline",
            username: "Estudante",
            xp: 0,
            lives: 5,
            level: 1,
            streak: 1,
            isAdmin: false,
            missions: [],
            history: [],
          });
          setLoading(false);
        }
      }
    });
    return () => { unsub(); unsubRef.current?.(); };
  }, []);

  const handleSetupSave = async (username) => {
    const newUser = {
      uid: authUser.uid,
      username,
      xp: 0,
      lives: 5,
      level: 1,
      streak: 1,
      isAdmin: false,
      missions: DEFAULT_MISSIONS.map((m) => m.id),
      history: [],
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", authUser.uid), newUser);
    } catch {
      setUserData(newUser);
    }
    setShowSetup(false);
  };

  const handleXpGain = useCallback(async (amount) => {
    if (!userData) return;
    const newXp = (userData.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    try {
      if (authUser?.uid && authUser.uid !== "offline") {
        await updateDoc(doc(db, "users", authUser.uid), { xp: newXp, level: newLevel });
      } else {
        setUserData((u) => ({ ...u, xp: newXp, level: newLevel }));
      }
    } catch {
      setUserData((u) => ({ ...u, xp: newXp, level: newLevel }));
    }
  }, [userData, authUser]);

  const handleLiveLost = useCallback(async () => {
    if (!userData || userData.lives <= 0) return;
    const newLives = userData.lives - 1;
    try {
      if (authUser?.uid && authUser.uid !== "offline") {
        await updateDoc(doc(db, "users", authUser.uid), { lives: newLives });
      } else {
        setUserData((u) => ({ ...u, lives: newLives }));
      }
    } catch {
      setUserData((u) => ({ ...u, lives: newLives }));
    }
  }, [userData, authUser]);

  const VIEWS = {
    dashboard: <Dashboard user={userData} onNavigate={setView} />,
    quiz: <QuizMode user={userData} onXpGain={handleXpGain} onLiveLost={handleLiveLost} />,
    teste: <QuizMode user={userData} onXpGain={handleXpGain} onLiveLost={handleLiveLost} testMode />,
    flashcards: <FlashcardsMode onXpGain={handleXpGain} />,
    ia: <IAMode onXpGain={handleXpGain} />,
    missoes: <MissoesMode user={userData} onXpGain={handleXpGain} />,
    ranking: <RankingMode currentUser={userData} />,
    admin: <AdminPanel currentUser={userData} />,
  };

  const VIEW_TITLES = {
    dashboard: "Início",
    quiz: "Quiz",
    teste: "Modo Teste",
    flashcards: "Revisões",
    ia: "Explicação IA",
    missoes: "Missões",
    ranking: "Ranking",
    admin: "Administração",
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-logo">
          <span className="loading-emoji">✨</span>
          <h1>Estudo Mágico Pro</h1>
          <div className="loading-bar">
            <div className="loading-fill" />
          </div>
          <p>A carregar o teu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        {showSetup && <SetupModal onSave={handleSetupSave} />}

        {/* Header */}
        <header className="app-header glass">
          <div className="header-inner">
            <div className="header-brand">
              {view !== "dashboard" && (
                <button className="btn-back" onClick={() => setView("dashboard")}>
                  ‹
                </button>
              )}
              <span className="brand-icon">✨</span>
              <span className="brand-name">
                {view === "dashboard" ? "Estudo Mágico Pro" : VIEW_TITLES[view]}
              </span>
            </div>
            {userData?.isAdmin && (
              <button
                className="btn-admin"
                onClick={() => setView(view === "admin" ? "dashboard" : "admin")}
                title="Painel Admin"
              >
                🛡️
              </button>
            )}
          </div>
        </header>

        {/* Stats Bar */}
        <StatBar user={userData} />

        {/* Main Content */}
        <main className="app-main">
          <ErrorBoundary>
            {VIEWS[view] || VIEWS.dashboard}
          </ErrorBoundary>
        </main>

        {/* Bottom Nav */}
        <nav className="bottom-nav glass">
          {[
            { id: "dashboard", icon: "🏠", label: "Início" },
            { id: "quiz", icon: "🎯", label: "Quiz" },
            { id: "missoes", icon: "📋", label: "Missões" },
            { id: "ranking", icon: "🏅", label: "Ranking" },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${view === item.id ? "nav-active" : ""}`}
              onClick={() => setView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
}

export default App;

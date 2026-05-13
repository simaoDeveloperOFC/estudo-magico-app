// App.js
import React, { useState, useEffect } from 'react';
// Outros imports...

// COLOCA AQUI (Linha 10 ou similar, fora do App)
const ProgressToNextLevel = ({ xp }) => {
  const nextLevelXP = 500;
  const currentLevelXP = xp % nextLevelXP;
  const percentage = (currentLevelXP / nextLevelXP) * 100;

  return (
    <div className="w-full bg-slate-200 h-3 rounded-full mt-2">
      <div 
        className="bg-indigo-600 h-full transition-all duration-500" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function App() {
  // O resto do teu código...
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Camera, Upload, Brain, CheckCircle, 
  ChevronRight, Sparkles, Image as ImageIcon, 
  Trophy, AlertTriangle, Play, Trash2, Globe,
  Flame, History, Crown, Target, Zap, LayoutDashboard,
  Bell, Clock, Settings, X, MessageCircle, LogIn, RefreshCcw,
  Mail, User, ShieldCheck, Languages, Paperclip, GraduationCap, MapPin, ListChecks,
  Plus, Book as BookIcon, Search, Library, Bookmark, Target as TargetIcon, ClipboardList,
  FileText, Sword, Timer, HeartPulse, GraduationCap as GradIcon, Languages as LangIcon,
  Share2, Copy, Check
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, query, getDocs, writeBatch
} from 'firebase/firestore';

// --- Configuração Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyDbxYl7ZIR8kSi5jCu6FkdnHF8zGAXcG7g",
  authDomain: "estudo-magico-3276c.firebaseapp.com",
  projectId: "estudo-magico-3276c",
  storageBucket: "estudo-magico-3276c.firebasestorage.app",
  messagingSenderId: "17316174654",
  appId: "1:17316174654:web:a98e122832c2f0b44cea6f",
  measurementId: "G-Q4BEFNJZC8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// --- Utilitários ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 5) {
  let delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw { status: response.status, message: `HTTP_${response.status}` };
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delays[i]);
    }
  }
}

// --- Componentes UI ---
const Button3D = ({ children, color = "blue", onClick, disabled, className = "" }) => {
  const colors = {
    blue: "bg-blue-600 shadow-[0_5px_0_0_#1d4ed8] active:shadow-[0_0px_0_0_#1d4ed8]",
    green: "bg-emerald-600 shadow-[0_5px_0_0_#047857] active:shadow-[0_0px_0_0_#047857]",
    purple: "bg-indigo-600 shadow-[0_5px_0_0_#4338ca] active:shadow-[0_0px_0_0_#4338ca]",
    orange: "bg-orange-600 shadow-[0_5px_0_0_#c2410c] active:shadow-[0_0px_0_0_#c2410c]",
    white: "bg-white text-slate-800 border-2 border-slate-200 shadow-[0_5px_0_0_#e2e8f0] active:shadow-[0_0px_0_0_#e2e8f0]",
    red: "bg-rose-600 shadow-[0_5px_0_0_#be123c] active:shadow-[0_0px_0_0_#be123c]",
    indigo: "bg-indigo-700 shadow-[0_5px_0_0_#3730a3] active:shadow-[0_0px_0_0_#3730a3]",
    rose: "bg-rose-500 shadow-[0_5px_0_0_#e11d48] active:shadow-[0_0px_0_0_#e11d48]",
  };
  return (
    <button onClick={(e) => { e.preventDefault(); onClick && onClick(); }} disabled={disabled}
      className={`relative inline-flex items-center justify-center font-bold py-3 px-6 rounded-xl transition-all duration-150 active:translate-y-[5px] ${colors[color]} ${color === 'white' ? 'text-slate-800' : 'text-white'} ${disabled ? 'opacity-50 grayscale' : 'hover:brightness-105'} ${className}`}>
      {children}
    </button>
  );
};

const Card3D = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''} ${className}`}>
    {children}
  </div>
);

// --- Aplicação Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [regForm, setRegForm] = useState({
    name: '',
    country: 'Portugal',
    language: 'Português',
    grade: '10.º Ano'
  });

  const [profile, setProfile] = useState({ 
    xp: 0, level: 1, name: 'Utilizador',
    grade: '10.º Ano', country: 'Portugal', language: 'Português'
  });

  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Estados de Estudo
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [matrix, setMatrix] = useState('');
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isTestMode, setIsTestMode] = useState(false);

  // Estados Arena Quiz
  const [quizConfig, setQuizConfig] = useState({ subject: '', mode: 'exam' });
  const [quizState, setQuizState] = useState({ current: 0, selected: null, checked: false, score: 0, finished: false, lives: 3 });

  // Estados Auxiliares
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [settingsTab, setSettingsTab] = useState('profile');
  const fileInputRef = useRef(null);
  const [ocrTarget, setOcrTarget] = useState('notes');

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    setTimeout(() => setShowIntro(false), 2000);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) checkUserProfile(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !authReady) return;
    const unsubProf = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), (s) => s.exists() && setProfile(s.data()));
    const unsubLb = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard'), (s) => setLeaderboard(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.xp - a.xp)));
    const unsubBooks = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'books'), (s) => setBooks(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubHistory = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });

    return () => { unsubProf(); unsubLb(); unsubBooks(); unsubHistory(); };
  }, [user, authReady]);

  const checkUserProfile = async (u) => {
    const snap = await getDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'settings', 'profile'));
    if (!snap.exists()) {
      setIsNewUser(true);
    } else { 
      setProfile(snap.data()); 
      setAuthReady(true); 
      setIsNewUser(false); 
    }
  };

  const handleFinishLogin = async () => {
    if (!regForm.name.trim() || !user) return;
    setLoading(true);
    const initialProfile = { 
      xp: 0, 
      level: 1, 
      ...regForm 
    };
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), initialProfile);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid), { name: regForm.name, xp: 0, level: 1 });
    setProfile(initialProfile); 
    setIsNewUser(false); 
    setAuthReady(true); 
    setView('dashboard');
    setLoading(false);
  };

  const updateXP = async (amount) => {
    if (!user || !profile) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { xp: newXP, level: newLevel });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid), { xp: newXP, level: newLevel });
  };

  const saveToHistory = async (type, title, content) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), {
      type,
      title,
      content,
      timestamp: serverTimestamp()
    });
  };

  const clearHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'history'));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareText = `Ei malta! Experimentem esta app que estou a usar para estudar: "Estudo Mágico Pro". Tem resumos automáticos, quizes da nossa matéria e um ranking da turma! 🚀📚 \n\nLink: ${window.location.href}`;
    document.execCommand('copy'); 
    // Fallback manual de cópia se o navigator.clipboard não funcionar no iframe
    const el = document.createElement('textarea');
    el.value = shareText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    setCopied(true);
    setTimeout(() => {
        setCopied(false);
        setShowShareModal(false);
    }, 2000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        const prompt = ocrTarget === 'matrix' 
          ? "Lê o texto desta matriz de teste. Retorna apenas os tópicos, sem decorações de markdown ou asteriscos, um por linha."
          : "Extrai o texto destes apontamentos. Sem markdown.";
        const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64Data } }] }] })
        });
        const text = res.candidates[0].content.parts[0].text.replace(/\*\*/g, '');
        if (ocrTarget === 'matrix') setMatrix(prev => prev + (prev ? "\n" : "") + text);
        else setNotes(prev => prev + (prev ? "\n" : "") + text);
      };
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGenerateStudy = async (testMode = false) => {
    if (!subject.trim() || !notes.trim()) {
      alert("Preenche a disciplina e os apontamentos primeiro.");
      return;
    }
    
    setLoading(true);
    setIsTestMode(testMode);
    try {
      const prompt = `Responde apenas em JSON. Disciplina: ${subject}. ${testMode ? 'Matriz: ' + matrix : ''}. Apontamentos: ${notes}. Explica os conceitos chave e gera 10 perguntas de escolha múltipla sobre a matéria. JSON: { "summary": [{"title": "...", "content": "...", "emoji": "🎯"}], "quiz": [{"question": "...", "options": ["...", "..."], "correctAnswerIndex": 0, "explanation": "..."}] }`;
      
      const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
        method: 'POST', 
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { responseMimeType: "application/json" } 
        }) 
      });
      
      const data = JSON.parse(res.candidates[0].content.parts[0].text);
      setStudyData(data);
      
      await saveToHistory(testMode ? 'Test Mode' : 'Daily Mode', subject, data);
      setQuizState({ current: 0, selected: null, checked: false, score: 0, finished: false, lives: 3 });
      setActiveTab('summary');
      setView('study');
    } catch (e) { 
      console.error(e);
      alert("Erro na geração de conteúdo."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStartArenaQuiz = async (modeId, modeTitle) => {
    if (!quizConfig.subject.trim()) {
      alert("Escreve o tema primeiro!");
      return;
    }
    setLoading(true);
    try {
      const count = modeId === 'marathon' ? 20 : (modeId === 'survival' ? 15 : 5);
      const prompt = `Gera um quiz de ${count} perguntas de escolha múltipla sobre ${quizConfig.subject}. Estilo: ${modeTitle}. Responde apenas JSON: { "quiz": [{"question": "...", "options": ["...", "..."], "correctAnswerIndex": 0, "explanation": "..."}] }`;
      
      const res = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
        method: 'POST', 
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { responseMimeType: "application/json" } 
        }) 
      });
      
      const data = JSON.parse(res.candidates[0].content.parts[0].text);
      const fullData = { summary: [], quiz: data.quiz };
      setSubject(quizConfig.subject);
      setStudyData(fullData);
      setQuizConfig({...quizConfig, mode: modeId});

      await saveToHistory('Arena Quiz', `${quizConfig.subject} (${modeTitle})`, fullData);
      setQuizState({ current: 0, selected: null, checked: false, score: 0, finished: false, lives: 3 });
      setActiveTab('quiz');
      setView('study');
    } catch(e) { 
      console.error(e);
      alert("Falha ao gerar arena."); 
    } finally { 
      setLoading(false); 
    }
  };

  if (showIntro) return <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center"><Brain className="text-indigo-600 animate-pulse" size={48} /></div>;

  if (!user || isNewUser) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card3D className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
             <GraduationCap className="text-white" size={32} />
           </div>
           <h2 className="text-2xl font-black text-slate-900">Bem-vindo à Academia!</h2>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Configura o teu perfil rápido</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400">COMO TE CHAMAS?</label>
             <input className="w-full p-4 border-2 rounded-xl font-bold outline-none focus:border-indigo-500 transition-all" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="Teu nome ou alcunha" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400">PAÍS</label>
               <select className="w-full p-4 border-2 rounded-xl font-bold bg-white outline-none" value={regForm.country} onChange={e => setRegForm({...regForm, country: e.target.value})}>
                 <option>Portugal</option><option>Brasil</option><option>Angola</option><option>Cabo Verde</option><option>Outro</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400">ANO ESCOLAR</label>
               <select className="w-full p-4 border-2 rounded-xl font-bold bg-white outline-none" value={regForm.grade} onChange={e => setRegForm({...regForm, grade: e.target.value})}>
                 <option>7.º Ano</option><option>8.º Ano</option><option>9.º Ano</option><option>10.º Ano</option><option>11.º Ano</option><option>12.º Ano</option><option>Universidade</option>
               </select>
            </div>
          </div>
        </div>
        <Button3D color="indigo" className="w-full py-4 mt-4" onClick={handleFinishLogin} disabled={!regForm.name.trim()}>Começar a Aprender!</Button3D>
      </Card3D>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-700 p-4 md:p-8">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      
      {loading && (
        <div className="fixed inset-0 bg-white/70 z-[200] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-indigo-600 animate-pulse text-sm">MAGIA A ACONTECER...</p>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <Card3D className="max-w-sm w-full space-y-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                 <Share2 size={32} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black">Convidar Turma</h3>
                 <p className="text-slate-500 text-xs font-medium">Copia o link abaixo e envia para o grupo de WhatsApp para competirem no Ranking!</p>
              </div>
              <button onClick={handleCopyLink} className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-black transition-all ${copied ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'}`}>
                 {copied ? <><Check size={18} /> Copiado!</> : <><Copy size={18} /> Copiar Mensagem de Partilha</>}
              </button>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600">Fechar</button>
           </Card3D>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="bg-white border rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200"><User className="text-slate-400" size={32} /></div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Olá, {profile.name}!</h1>
                <div className="flex gap-2 items-center">
                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-black">{profile.grade}</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1"><MapPin size={10} /> {profile.country}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
               <div className="text-right px-4 border-r border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">XP TOTAL</p>
                  <p className="text-3xl font-black text-indigo-600 leading-none">{profile.xp}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setShowShareModal(true)} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-2xl text-white transition-all shadow-lg shadow-indigo-100"><Share2 size={24}/></button>
                 <button onClick={() => setView('history')} className="bg-white hover:bg-slate-50 p-4 rounded-2xl border transition-colors shadow-sm"><History size={24} className="text-slate-400" /></button>
                 <button onClick={() => setView('settings')} className="bg-white hover:bg-slate-50 p-4 rounded-2xl border transition-colors shadow-sm"><Settings size={24} className="text-slate-400" /></button>
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card3D onClick={() => setView('daily_mode')} className="border-blue-100 hover:bg-blue-50/50 group">
              <BookOpen className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Revisão Diária</h2>
              <p className="text-slate-500 text-xs font-medium">Resume e entende o teu dia de aulas num clique.</p>
            </Card3D>
            <Card3D onClick={() => setView('test_mode')} className="border-rose-100 hover:bg-rose-50/50 group">
              <TargetIcon className="text-rose-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Modo Teste</h2>
              <p className="text-slate-500 text-xs font-medium">Foca na matriz e nos objetivos específicos do exame.</p>
            </Card3D>
            <Card3D onClick={() => setView('arena_hub')} className="border-purple-100 hover:bg-purple-50/50 group">
              <Sword className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Arena Quiz</h2>
              <p className="text-slate-500 text-xs font-medium">5 modos de treino intensivo para dominares a matéria.</p>
            </Card3D>
            <Card3D onClick={() => setView('chat_ia')} className="border-emerald-100 hover:bg-emerald-50/50 group">
              <MessageCircle className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Modo Explica</h2>
              <p className="text-slate-500 text-xs font-medium">Tira dúvidas rápidas com o teu tutor pessoal de IA.</p>
            </Card3D>
            <Card3D onClick={() => setView('leaderboard')} className="border-yellow-100 hover:bg-yellow-50/50 group">
              <Trophy className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Ranking</h2>
              <p className="text-slate-500 text-xs font-medium">Compara o teu progresso com outros estudantes.</p>
            </Card3D>
            <Card3D onClick={() => { setView('settings'); setSettingsTab('books'); }} className="border-slate-200 group">
              <Library className="text-slate-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h2 className="text-lg font-black">Mochila</h2>
              <p className="text-slate-500 text-xs font-medium">Acede aos teus manuais e materiais guardados.</p>
            </Card3D>
          </div>
        </div>
      )}

      {/* HISTÓRICO */}
      {view === 'history' && (
        <div className="max-w-4xl mx-auto space-y-6">
           <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
           <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-900">O Teu Histórico</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Tudo o que já estudaste</p>
           </div>
           <div className="grid gap-4">
              {history.length === 0 ? (
                <Card3D className="text-center py-12">
                   <Clock className="mx-auto text-slate-200 mb-4" size={48} />
                   <p className="text-slate-400 font-bold">Ainda não tens nada guardado.</p>
                </Card3D>
              ) : (
                history.map(item => (
                  <Card3D key={item.id} onClick={() => {
                    setSubject(item.title);
                    setStudyData(item.content);
                    setView('study');
                  }} className="flex items-center justify-between group hover:border-indigo-300">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                          {item.type === 'Arena Quiz' ? <Sword size={24}/> : <BookOpen size={24}/>}
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900">{item.title}</h4>
                          <div className="flex gap-2 items-center">
                             <span className="text-[9px] font-black uppercase text-indigo-600">{item.type}</span>
                             <span className="text-slate-300">•</span>
                             <span className="text-[9px] font-black uppercase text-slate-400">{item.timestamp?.toDate().toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                  </Card3D>
                ))
              )}
           </div>
        </div>
      )}

      {/* MODO DIÁRIO */}
      {view === 'daily_mode' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
          <Card3D className="space-y-6 border-t-8 border-t-blue-500">
            <h2 className="text-2xl font-black">📚 Revisão Diária</h2>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-200" placeholder="Disciplina..." value={subject} onChange={e => setSubject(e.target.value)} />
              <div className="space-y-2">
                <div className="flex justify-between px-1 items-center">
                   <label className="text-[10px] font-black text-slate-400">APONTAMENTOS DO DIA</label>
                   <button onClick={() => { setOcrTarget('notes'); fileInputRef.current.click(); }} className="text-blue-500 text-[10px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity"><Camera size={14} /> SCANNER</button>
                </div>
                <textarea className="w-full p-4 bg-slate-50 border-2 rounded-2xl h-64 font-medium outline-none resize-none focus:border-blue-200" placeholder="Cola aqui os teus apontamentos..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <Button3D color="blue" className="w-full py-5" onClick={() => handleGenerateStudy(false)}>Gerar Resumo Mágico</Button3D>
          </Card3D>
        </div>
      )}

      {/* MODO TESTE */}
      {view === 'test_mode' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
          <Card3D className="space-y-6 border-t-8 border-t-rose-500">
            <h2 className="text-2xl font-black">🎯 Modo Teste</h2>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-rose-200" placeholder="Disciplina (ex: Geologia)..." value={subject} onChange={e => setSubject(e.target.value)} />
              <div className="space-y-2">
                <div className="flex justify-between px-1 items-center">
                   <label className="text-[10px] font-black text-slate-400">MATRIZ DO TESTE</label>
                   <button onClick={() => { setOcrTarget('matrix'); fileInputRef.current.click(); }} className="text-rose-500 text-[10px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity"><Camera size={14} /> SCANNER MATRIZ</button>
                </div>
                <textarea className="w-full p-4 bg-rose-50/20 border-2 border-rose-100 rounded-2xl h-32 font-medium outline-none resize-none" placeholder="O que vai sair no teste?" value={matrix} onChange={e => setMatrix(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between px-1 items-center">
                   <label className="text-[10px] font-black text-slate-400">TEUS APONTAMENTOS</label>
                   <button onClick={() => { setOcrTarget('notes'); fileInputRef.current.click(); }} className="text-indigo-500 text-[10px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity"><Camera size={14} /> SCANNER APONTAMENTOS</button>
                </div>
                <textarea className="w-full p-4 bg-slate-50 border-2 rounded-2xl h-48 font-medium outline-none resize-none focus:border-indigo-100" placeholder="Escreve ou tira foto à tua matéria..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <Button3D color="rose" className="w-full py-5" onClick={() => handleGenerateStudy(true)}>Gerar Guia de Estudo</Button3D>
          </Card3D>
        </div>
      )}

      {/* ARENA HUB */}
      {view === 'arena_hub' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Arena Quiz</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Escolhe o teu modo de treino</p>
          </div>
          <div className="space-y-4">
             <input className="w-full p-6 bg-white border-4 border-purple-100 rounded-3xl font-black text-xl text-center outline-none focus:border-purple-300 transition-all shadow-sm" placeholder="O QUE QUERES TREINAR HOJE?" value={quizConfig.subject} onChange={e => setQuizConfig({...quizConfig, subject: e.target.value})} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'exam', title: 'Exame Rápido', desc: '5 perguntas diretas e rápidas.', icon: <Timer />, color: 'blue' },
                  { id: 'marathon', title: 'Maratona XP', desc: '20 questões para os resistentes.', icon: <Zap />, color: 'purple' },
                  { id: 'theory', title: 'Mestre da Teoria', desc: 'Foco em conceitos e definições.', icon: <GradIcon />, color: 'orange' },
                  { id: 'practical', title: 'Desafio Prático', desc: 'Aplicação e lógica pura.', icon: <Sword />, color: 'indigo' },
                  { id: 'survival', title: 'Sobrevivência', desc: '3 vidas. Erraste? Perdeste.', icon: <HeartPulse />, color: 'red' },
                ].map(mode => (
                  <div key={mode.id} onClick={() => handleStartArenaQuiz(mode.id, mode.title)} className="cursor-pointer">
                    <Card3D className="border-2 border-transparent hover:border-purple-300 hover:bg-purple-50/30 flex items-center gap-4 group h-full">
                      <div className={`p-4 rounded-2xl bg-slate-100 text-slate-600 group-hover:scale-110 transition-transform`}>{mode.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-black text-lg">{mode.title}</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase">{mode.desc}</p>
                      </div>
                    </Card3D>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* ESTUDO E QUIZ */}
      {view === 'study' && studyData && (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          <div className="bg-white p-6 rounded-3xl border shadow-lg flex justify-between items-center">
             <h2 className="font-black text-lg">{subject}</h2>
             <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'summary' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>RESUMO</button>
               <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'quiz' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>TREINO</button>
             </div>
          </div>

          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {studyData.summary?.length > 0 ? (
                studyData.summary.map((s, i) => (
                  <Card3D key={i}>
                    <h3 className="font-black mb-2 flex items-center gap-2 text-indigo-600"><span className="text-2xl">{s.emoji || '✨'}</span> {s.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{s.content}</p>
                  </Card3D>
                ))
              ) : (
                <Card3D className="text-center">
                   <p className="text-slate-400 font-bold">Sem resumo disponível para este item.</p>
                </Card3D>
              )}
              <Button3D color="white" className="w-full py-4" onClick={() => setView('dashboard')}>Finalizar Sessão</Button3D>
            </div>
          ) : (
            <Card3D className="min-h-[400px] flex flex-col">
              {quizState.finished ? (
                <div className="text-center py-10 space-y-6 flex-1 flex flex-col justify-center">
                   <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trophy size={48} className="text-yellow-500" /></div>
                   <h2 className="text-3xl font-black text-slate-900">Treino Concluído!</h2>
                   <div className="space-y-1">
                      <p className="text-5xl font-black text-indigo-600 leading-none">{Math.round((quizState.score/studyData.quiz.length)*100)}%</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precisão da Sessão</p>
                   </div>
                   <Button3D color="indigo" className="w-full max-w-xs mx-auto" onClick={() => { updateXP(quizState.score * 10); setView('dashboard'); }}>Recolher XP</Button3D>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-center font-black text-[10px] text-slate-400">
                      <span className="bg-slate-50 px-3 py-1 rounded-full border">QUESTÃO {quizState.current + 1} / {studyData.quiz.length}</span>
                      {quizConfig.mode === 'survival' && <div className="flex gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">{Array(quizState.lives).fill('❤️').join('')}</div>}
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 leading-tight">{studyData.quiz[quizState.current].question}</h3>
                   <div className="grid gap-3 flex-1">
                     {studyData.quiz[quizState.current].options.map((opt, i) => (
                       <button key={i} disabled={quizState.checked} onClick={() => setQuizState({...quizState, selected: i})} className={`p-5 text-left rounded-2xl border-2 font-bold transition-all text-sm ${quizState.checked ? (i === studyData.quiz[quizState.current].correctAnswerIndex ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : (i === quizState.selected ? 'bg-rose-50 border-rose-500 text-rose-700' : 'opacity-40')) : (quizState.selected === i ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 hover:border-slate-200')}`}>{opt}</button>
                     ))}
                   </div>
                   {quizState.checked && (
                     <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500 text-xs font-medium text-slate-600 animate-in fade-in slide-in-from-top-2">
                        <strong>Explicação:</strong> {studyData.quiz[quizState.current].explanation}
                     </div>
                   )}
                   <div className="flex justify-end pt-4">
                      {!quizState.checked ? <Button3D disabled={quizState.selected === null} onClick={() => setQuizState({...quizState, checked: true})}>Validar Resposta</Button3D> : <Button3D onClick={() => {
                        const correct = quizState.selected === studyData.quiz[quizState.current].correctAnswerIndex;
                        const nextLives = correct ? quizState.lives : quizState.lives - 1;
                        const isGameOver = quizConfig.mode === 'survival' && nextLives <= 0;
                        const next = quizState.current + 1;
                        if (next < studyData.quiz.length && !isGameOver) setQuizState({...quizState, current: next, selected: null, checked: false, score: correct ? quizState.score + 1 : quizState.score, lives: nextLives});
                        else setQuizState({...quizState, finished: true, score: correct ? quizState.score + 1 : quizState.score, lives: nextLives});
                      }}>Próxima Pergunta</Button3D>}
                   </div>
                </div>
              )}
            </Card3D>
          )}
        </div>
      )}

      {/* DEFINIÇÕES */}
      {view === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
             <div className="flex bg-slate-50 p-1">
                <button onClick={() => setSettingsTab('profile')} className={`flex-1 py-3 font-black text-xs rounded-2xl transition-all ${settingsTab === 'profile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>PERFIL</button>
                <button onClick={() => setSettingsTab('books')} className={`flex-1 py-3 font-black text-xs rounded-2xl transition-all ${settingsTab === 'books' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>MOCHILA</button>
                <button onClick={() => setSettingsTab('data')} className={`flex-1 py-3 font-black text-xs rounded-2xl transition-all ${settingsTab === 'data' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>DADOS</button>
             </div>
             <div className="p-8 space-y-6">
                {settingsTab === 'profile' && (
                  <>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">NOME</label><input className="w-full p-4 border-2 rounded-xl font-bold focus:border-indigo-500 outline-none" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">PAÍS</label><select className="w-full p-4 border-2 rounded-xl font-bold bg-white outline-none" value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})}><option>Portugal</option><option>Brasil</option><option>Angola</option><option>Outro</option></select></div>
                       <div className="space-y-1"><label className="text-[10px] font-black text-slate-400">ANO ESCOLAR</label><select className="w-full p-4 border-2 rounded-xl font-bold bg-white outline-none" value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})}><option>7.º Ano</option><option>8.º Ano</option><option>9.º Ano</option><option>10.º Ano</option><option>11.º Ano</option><option>12.º Ano</option><option>Universidade</option></select></div>
                    </div>
                    <Button3D color="indigo" className="w-full py-4" onClick={async () => {
                       setLoading(true);
                       await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), profile);
                       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid), { name: profile.name });
                       setView('dashboard');
                       setLoading(false);
                    }}>Guardar Alterações</Button3D>
                  </>
                )}

                {settingsTab === 'books' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Library className="text-indigo-600" /> Manuais Registados</h3>
                    <div className="space-y-2">
                       {books.length === 0 && <p className="text-slate-400 text-sm italic py-4">Nenhum manual na tua mochila ainda...</p>}
                       {books.map(b => <div key={b.id} className="p-4 bg-slate-50 border-2 rounded-2xl flex justify-between items-center font-bold">{b.title} <Trash2 className="text-rose-400 cursor-pointer hover:scale-110 transition-transform" size={18} onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'books', b.id))} /></div>)}
                       <Button3D color="white" className="w-full py-4 border-dashed border-2" onClick={() => addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'books'), { title: 'Manual de ' + (prompt('Qual a disciplina?') || 'Estudo'), createdAt: serverTimestamp() })}>+ Adicionar Novo Manual</Button3D>
                    </div>
                  </div>
                )}

                {settingsTab === 'data' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl space-y-4">
                       <h3 className="text-rose-600 font-black flex items-center gap-2"><AlertTriangle size={20}/> Zona de Perigo</h3>
                       <p className="text-rose-700 text-xs font-bold leading-relaxed">Limpar o histórico irá remover permanentemente todos os teus resumos e quizes guardados. Esta ação não pode ser desfeita.</p>
                       <Button3D color="red" className="w-full" onClick={() => { if(confirm("Tens a certeza que queres apagar TODO o teu histórico?")) clearHistory(); }}>Apagar Histórico de Estudo</Button3D>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {view === 'leaderboard' && (
        <div className="max-w-2xl mx-auto space-y-6">
           <Button3D color="white" onClick={() => setView('dashboard')}>← Voltar</Button3D>
           <div className="bg-white rounded-3xl border overflow-hidden shadow-xl">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-10 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Trophy size={120} /></div>
                 <h2 className="text-3xl font-black">Top Academia</h2>
                 <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Os maiores génios em destaque</p>
              </div>
              <div className="divide-y">
                 {leaderboard.map((u, i) => (
                   <div key={u.id} className={`p-6 flex justify-between items-center transition-colors ${u.id === user.uid ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-6">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'text-slate-300'}`}>{i + 1}</div>
                         <div>
                            <p className="font-black text-slate-900 text-lg leading-tight">{u.name} {u.id === user.uid && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-1">TU</span>}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">NÍVEL {u.level || 1}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-600 text-xl">{u.xp}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">PONTOS XP</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODO EXPLICA */}
      {view === 'chat_ia' && (
        <div className="max-w-4xl mx-auto h-[80vh] flex flex-col gap-4">
           <Button3D color="white" onClick={() => setView('dashboard')} className="self-start">← Voltar</Button3D>
           <Card3D className="flex-1 flex flex-col p-0 overflow-hidden border-emerald-100 border-2">
              <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><MessageCircle /></div>
                 <div>
                    <h3 className="font-black text-lg leading-none">Modo Explica</h3>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Tutor Inteligente Online</p>
                 </div>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 animate-bounce"><Sparkles size={32} /></div>
                 <h4 className="text-xl font-black text-slate-900">Estou aqui para te ajudar!</h4>
                 <p className="text-slate-500 text-sm max-w-xs">Podes perguntar qualquer coisa sobre as tuas aulas ou pedir para explicar um conceito difícil.</p>
              </div>
              <div className="p-4 bg-slate-50 border-t flex gap-2">
                 <input className="flex-1 p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-300" placeholder="Escreve a tua dúvida..." />
                 <Button3D color="green" className="px-8" onClick={() => alert("Função de chat em desenvolvimento!")}><Zap size={20} /></Button3D>
              </div>
           </Card3D>
        </div>
      )}
    </div>
  );
}

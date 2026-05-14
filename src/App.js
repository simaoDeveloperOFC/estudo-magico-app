import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BookOpen, Camera, Upload, Brain, CheckCircle, 
  ChevronRight, Sparkles, Image as ImageIcon, 
  Trophy, AlertTriangle, Play, Trash2, Globe,
  Flame, History, Crown, Target, Zap, LayoutDashboard,
  Bell, Clock, Settings, X, MessageCircle, LogIn, RefreshCcw,
  Mail, User, ShieldCheck, Languages, Paperclip, GraduationCap, MapPin, ListChecks,
  Plus, Book as BookIcon, Search, Library, Bookmark, Target as TargetIcon, ClipboardList,
  FileText, Sword, Timer, HeartPulse, Download, Star, Award, ExternalLink, ShieldAlert,
  BarChart3, Users, Send, Eye, Ban, CameraOff, ShoppingCart, MessageSquare, Bot, UserPlus, Fingerprint
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, query, getDocs, writeBatch,
  where, limit, orderBy
} from 'firebase/firestore';

// --- Configuração Firebase ---
const apiKey = ""; 
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'estudo-magico-pro-vfinal';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAILS = ['simaopereira953@gmail.com', 'Henrique.xaves2013@gmail.com'];

// --- Componentes UI ---
const Button3D = ({ children, color = "blue", onClick, disabled, className = "" }) => {
  const colors = {
    blue: "bg-blue-600 shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-[4px]",
    green: "bg-emerald-600 shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-[4px]",
    purple: "bg-indigo-600 shadow-[0_4px_0_0_#4338ca] active:shadow-none active:translate-y-[4px]",
    white: "bg-white text-slate-800 border shadow-[0_4px_0_0_#e2e8f0] active:shadow-none active:translate-y-[4px]",
    rose: "bg-rose-500 shadow-[0_4px_0_0_#e11d48] active:shadow-none active:translate-y-[4px]",
    slate: "bg-slate-500 shadow-[0_4px_0_0_#475569] active:shadow-none active:translate-y-[4px]",
    amber: "bg-amber-500 shadow-[0_4px_0_0_#d97706] active:shadow-none active:translate-y-[4px]",
  };
  return (
    <button onClick={(e) => { e.preventDefault(); !disabled && onClick?.(); }} disabled={disabled}
      className={`relative inline-flex items-center justify-center font-bold py-3 px-6 rounded-xl transition-all ${colors[color]} ${color === 'white' ? 'text-slate-800' : 'text-white'} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-105'} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''} ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(''); // Estado para capturar erros de auth
  const [view, setView] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); 
  // Forms
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', country: 'Portugal', grade: '10.º Ano' });

  // Estados de Estudo & Chat
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [studyData, setStudyData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  
  // Loja & Items
  const [shopItems] = useState([
    { id: 'title_pro', name: 'Mago Pro', cost: 500, type: 'title' },
    { id: 'title_supremo', name: 'Mago Supremo', cost: 1500, type: 'title' },
    { id: 'title_lenda', name: 'Lenda do Estudo', cost: 5000, type: 'title' },
    { id: 'boost_2x', name: 'Multiplicador 2x XP (24h)', cost: 1000, type: 'booster' },
  ]);

  // Estados Sistema
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [quizState, setQuizState] = useState({ current: 0, selected: null, checked: false, score: 0, finished: false });

  const isAdmin = useMemo(() => profile && ADMIN_EMAILS.includes(profile.email), [profile]);

  // 1. Auth & Profile Logic
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const profRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProf = onSnapshot(profRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      setLoading(false);
    });

    const leaderQuery = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
    const unsubLeader = onSnapshot(leaderQuery, (snap) => {
      const l = snap.docs.map(d => d.data());
      setLeaderboard(l.sort((a,b) => b.xp - a.xp).slice(0, 15));
    });

    const histRef = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
    const unsubHist = onSnapshot(histRef, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });

    const msgQuery = collection(db, 'artifacts', appId, 'public', 'data', 'global_messages');
    const unsubMsg = onSnapshot(msgQuery, (snap) => {
      setGlobalMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubProf(); unsubLeader(); unsubHist(); unsubMsg(); };
  }, [user]);

  // Actions
  const handleAuth = async () => {
    setLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        // Validação básica local
        if (!authForm.name || !authForm.email || !authForm.password) {
          throw new Error("Preenche todos os campos!");
        }
        
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        
        const initialProfile = {
          uid: cred.user.uid,
          name: authForm.name,
          email: authForm.email,
          country: authForm.country,
          grade: authForm.grade,
          xp: 0,
          level: 1,
          titles: [],
          activeTitle: '',
          photoURL: '',
          xpMultiplier: 1,
          createdAt: serverTimestamp()
        };

        // Garantir criação do perfil antes de prosseguir
        await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'settings', 'profile'), initialProfile);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', cred.user.uid), {
          uid: cred.user.uid,
          name: authForm.name,
          xp: 0,
          level: 1,
          activeTitle: ''
        });
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
    } catch (e) {
      console.error("Erro na Auth:", e);
      let msg = e.message;
      if (e.code === 'auth/operation-not-allowed') {
        msg = "O login por E-mail está desativado no Firebase. Ativa 'Email/Password' na consola do Firebase > Authentication > Sign-in method.";
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = "Este e-mail já está registado.";
      } else if (msg.includes('auth/invalid-email')) {
        msg = "E-mail inválido.";
      } else if (msg.includes('auth/weak-password')) {
        msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
      } else if (msg.includes('auth/invalid-credential')) {
        msg = "Dados de login incorretos.";
      }
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      // Criar perfil básico para convidado se não existir
      const profRef = doc(db, 'artifacts', appId, 'users', cred.user.uid, 'settings', 'profile');
      const docSnap = await getDoc(profRef);
      if (!docSnap.exists()) {
        const guestProfile = {
          uid: cred.user.uid,
          name: "Convidado Mágico",
          email: "guest@estudomagico.pro",
          xp: 0,
          level: 1,
          titles: [],
          activeTitle: 'Viajante',
          createdAt: serverTimestamp()
        };
        await setDoc(profRef, guestProfile);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', cred.user.uid), {
          uid: cred.user.uid,
          name: "Convidado Mágico",
          xp: 0,
          level: 1,
          activeTitle: 'Viajante'
        });
      }
    } catch (e) {
      setAuthError("Erro no login de convidado: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateXP = async (amount) => {
    if (!profile) return;
    const bonus = profile.xpMultiplier || 1;
    const totalXP = (profile.xp || 0) + (amount * bonus);
    const newLevel = Math.floor(totalXP / 1000) + 1;
    const profRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    await updateDoc(profRef, { xp: totalXP, level: newLevel });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid), { xp: totalXP, level: newLevel });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const profRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
        await updateDoc(profRef, { photoURL: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const buyItem = async (item) => {
    if (profile.xp < item.cost) return alert("XP Insuficiente!");
    const profRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    
    if (item.type === 'title') {
      const updatedTitles = [...(profile.titles || []), item.name];
      await updateDoc(profRef, { 
        xp: profile.xp - item.cost, 
        titles: updatedTitles,
        activeTitle: item.name
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid), { activeTitle: item.name });
    } else if (item.type === 'booster') {
      await updateDoc(profRef, { 
        xp: profile.xp - item.cost, 
        xpMultiplier: 2
      });
    }
    alert(`Compraste: ${item.name}!`);
  };

  const sendChatMessage = async () => {
    if (!currentInput) return;
    const userMsg = { role: 'user', text: currentInput };
    setChatMessages([...chatMessages, userMsg]);
    setCurrentInput('');
    
    try {
      const prompt = `És o Mestre da IA, um explicador especializado. Ajuda o aluno com esta dúvida: ${currentInput}. O aluno está no ${profile.grade}.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const botText = data.candidates[0].content.parts[0].text;
      setChatMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (e) { console.error(e); }
  };

  // Admin Abuse Logic
  const adminAbuseAction = async (targetUid, action, val) => {
    if (!isAdmin) return;
    const targetRef = doc(db, 'artifacts', appId, 'users', targetUid, 'settings', 'profile');
    const targetLeaderRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', targetUid);
    
    if (action === 'give_xp') {
      await updateDoc(targetRef, { xp: val });
      await updateDoc(targetLeaderRef, { xp: val });
    } else if (action === 'set_level') {
      await updateDoc(targetRef, { level: val });
      await updateDoc(targetLeaderRef, { level: val });
    } else if (action === 'give_title') {
      await updateDoc(targetRef, { activeTitle: val });
      await updateDoc(targetLeaderRef, { activeTitle: val });
    }
    alert("Abuso de Admin concluído com sucesso!");
  };

  // --- Views ---

  const Topbar = () => {
    const progress = ((profile?.xp % 1000) / 1000) * 100;
    return (
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile?.photoURL ? (
              <img src={profile.photoURL} className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-md" />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24}/></div>
            )}
            {profile?.xpMultiplier > 1 && <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[8px] font-black p-1 rounded-full border-2 border-white">2X</div>}
          </div>
          <div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none">{profile?.name}</span>
              {profile?.activeTitle && <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{profile.activeTitle}</span>}
            </div>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 bg-slate-50 p-1.5 rounded-2xl border">
          <button onClick={() => setView('dashboard')} className={`p-2 rounded-xl ${view === 'dashboard' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}><LayoutDashboard size={18}/></button>
          <button onClick={() => setView('chat')} className={`p-2 rounded-xl ${view === 'chat' ? 'bg-white shadow text-blue-500' : 'text-slate-400'}`}><MessageSquare size={18}/></button>
          <button onClick={() => setView('shop')} className={`p-2 rounded-xl ${view === 'shop' ? 'bg-white shadow text-emerald-500' : 'text-slate-400'}`}><ShoppingCart size={18}/></button>
          <button onClick={() => setView('leaderboard')} className={`p-2 rounded-xl ${view === 'leaderboard' ? 'bg-white shadow text-amber-500' : 'text-slate-400'}`}><Crown size={18}/></button>
          {isAdmin && <button onClick={() => setView('admin')} className={`p-2 rounded-xl ${view === 'admin' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-rose-600'}`}><ShieldAlert size={18}/></button>}
          <button onClick={() => setView('settings')} className={`p-2 rounded-xl ${view === 'settings' ? 'bg-white shadow text-slate-500' : 'text-slate-400'}`}><Settings size={18}/></button>
        </div>
      </header>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <Card className="max-w-md w-full space-y-6 animate-in zoom-in">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 transform rotate-3"><Sparkles size={40} /></div>
            <h1 className="text-4xl font-black">Estudo Mágico</h1>
            <p className="text-slate-400 font-bold">{authMode === 'login' ? 'Bem-vindo de volta!' : 'Cria a tua conta grátis'}</p>
          </div>

          <div className="space-y-3">
            {authMode === 'signup' && (
              <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Teu Nome" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
            )}
            <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" placeholder="E-mail" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" type="password" placeholder="Palavra-passe" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            
            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <select className="p-4 bg-slate-50 border-2 rounded-2xl font-bold appearance-none cursor-pointer" value={authForm.grade} onChange={e => setAuthForm({...authForm, grade: e.target.value})}>
                  <option>7.º Ano</option><option>8.º Ano</option><option>9.º Ano</option><option>10.º Ano</option><option>11.º Ano</option><option>12.º Ano</option>
                </select>
                <select className="p-4 bg-slate-50 border-2 rounded-2xl font-bold appearance-none cursor-pointer" value={authForm.country} onChange={e => setAuthForm({...authForm, country: e.target.value})}>
                  <option>Portugal</option><option>Brasil</option><option>Angola</option>
                </select>
              </div>
            )}
          </div>

          {}
          {authError && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-[11px] font-bold border border-rose-100 flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle size={14} className="shrink-0" />
              {authError}
            </div>
          )}

          <Button3D className="w-full h-14" color="blue" onClick={handleAuth} disabled={loading}>
            {loading ? <RefreshCcw className="animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
          </Button3D>
          
          <button 
            onClick={handleGuestLogin}
            className="w-full py-2 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            Ou entrar como Convidado (Modo de Teste)
          </button>
          
          <p className="text-center text-sm font-bold text-slate-400">
            {authMode === 'login' ? 'Novo por aqui?' : 'Já tens conta?'} 
            <button className="text-indigo-600 ml-1 hover:underline" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}>
              {authMode === 'login' ? 'Cria uma agora' : 'Faz Login'}
            </button>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 pb-24">
        
        {/* Dashboard */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            <Card onClick={() => setView('daily_mode')} className="hover:-translate-y-2 border-b-8 border-b-blue-500">
              <BookOpen className="text-blue-500 mb-4" size={32}/>
              <h3 className="font-black text-xl">Modo Diário</h3>
              <p className="text-slate-400 text-sm mt-1">Transforma apontamentos em resumos.</p>
            </Card>
            <Card onClick={() => setView('test_mode')} className="hover:-translate-y-2 border-b-8 border-b-rose-500">
              <TargetIcon className="text-rose-500 mb-4" size={32}/>
              <h3 className="font-black text-xl">Modo Teste</h3>
              <p className="text-slate-400 text-sm mt-1">Fotos da matriz e plano de estudo.</p>
            </Card>
            <Card onClick={() => setView('revisions')} className="hover:-translate-y-2 border-b-8 border-b-amber-500">
              <RefreshCcw className="text-amber-500 mb-4" size={32}/>
              <h3 className="font-black text-xl">Revisões</h3>
              <p className="text-slate-400 text-sm mt-1">Revisit conteúdos passados.</p>
            </Card>
          </div>
        )}

        {/* Chat IA */}
        {view === 'chat' && (
          <div className="max-w-2xl mx-auto h-[70vh] flex flex-col bg-white rounded-3xl border shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-4 border-b bg-blue-600 text-white flex items-center gap-3">
              <Bot />
              <h3 className="font-black">Mestre da IA</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <MessageSquare size={48} className="mb-2" />
                  <p className="font-black uppercase text-xs">Faz uma pergunta específica sobre a matéria</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input className="flex-1 p-3 bg-slate-50 border rounded-xl font-bold" placeholder="Dúvida sobre matemática..." value={currentInput} onChange={e => setCurrentInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChatMessage()} />
              <button onClick={sendChatMessage} className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20}/></button>
            </div>
          </div>
        )}

        {/* Shop View */}
        {view === 'shop' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-black text-emerald-600">Loja Mágica</h2>
              <p className="text-slate-400 font-bold">Troca o teu XP por itens lendários</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shopItems.map(item => (
                <Card key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${item.type === 'title' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {item.type === 'title' ? <Award size={32}/> : <Zap size={32}/>}
                    </div>
                    <div>
                      <h4 className="font-black text-xl">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type}</p>
                    </div>
                  </div>
                  <button onClick={() => buyItem(item)} className="bg-slate-100 px-6 py-3 rounded-2xl font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {item.cost} XP
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admin Abuse */}
        {view === 'admin' && isAdmin && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6">
            <h2 className="text-3xl font-black text-rose-600 flex items-center gap-3"><ShieldAlert /> Admin Abuse Zone</h2>
            <Card className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input id="target-id" className="p-4 bg-slate-50 border-2 rounded-2xl font-bold" placeholder="UID do Utilizador" />
                <input id="target-val" className="p-4 bg-slate-50 border-2 rounded-2xl font-bold" placeholder="Valor (XP/Lvl/Título)" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button3D color="amber" onClick={() => adminAbuseAction(document.getElementById('target-id').value, 'give_xp', Number(document.getElementById('target-val').value))}>Dar XP</Button3D>
                <Button3D color="purple" onClick={() => adminAbuseAction(document.getElementById('target-id').value, 'set_level', Number(document.getElementById('target-val').value))}>Set Level</Button3D>
                <Button3D color="blue" onClick={() => adminAbuseAction(document.getElementById('target-id').value, 'give_title', document.getElementById('target-val').value)}>Dar Título</Button3D>
              </div>
              <Button3D color="rose" className="w-full" onClick={() => adminAbuseAction(document.getElementById('target-id').value, 'give_title', "Amigo do Admin")}>Dar "Amigo do Admin"</Button3D>
            </Card>
          </div>
        )}

        {/* Settings */}
        {view === 'settings' && (
          <Card className="max-w-md mx-auto space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-center">Configurações</h2>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 border-b pb-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('pfp-upload').click()}>
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-500 shadow-xl" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center border-4 border-dashed"><Camera size={32}/></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center text-white text-xs font-black transition-all">MUDAR FOTO</div>
                  <input type="file" id="pfp-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-xl">{profile?.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{profile?.activeTitle || 'Sem Título'}</p>
                </div>
              </div>
              
              <Button3D color="white" className="w-full text-rose-600 border-rose-100" onClick={() => signOut(auth)}>Sair da Conta</Button3D>
            </div>
          </Card>
        )}

        {/* Leaderboard */}
        {view === 'leaderboard' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-center flex items-center justify-center gap-3"><Crown className="text-amber-500"/> Ranking Mundial</h2>
            <div className="space-y-2">
              {leaderboard.map((p, i) => (
                <div key={p.uid} className={`flex items-center justify-between p-4 bg-white rounded-2xl border-2 transition-all ${p.uid === user.uid ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100'}`}>
                   <div className="flex items-center gap-4">
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${i === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                     <div className="flex flex-col">
                       <span className="font-black">{p.name} {p.uid === user.uid && "(Tu)"}</span>
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">{p.activeTitle}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-black text-indigo-600">{p.xp} XP</p>
                     <p className="text-[10px] font-bold text-slate-300 uppercase">Lvl {p.level}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modo Diário Input */}
        {view === 'daily_mode' && (
          <Card className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-black">Criar Novo Resumo</h2>
            <div className="space-y-4">
              <input className="w-full p-4 border-2 rounded-2xl font-bold bg-slate-50" placeholder="Disciplina" value={subject} onChange={e => setSubject(e.target.value)} />
              <textarea className="w-full p-4 border-2 rounded-2xl h-48 font-medium bg-slate-50" placeholder="Apontamentos..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <Button3D className="w-full" onClick={async () => {
               setLoading(true);
               try {
                 const prompt = `Gera um resumo e quiz JSON para a disciplina ${subject} com base nestas notas: ${notes}. Responde apenas JSON: {"summary": [{"title": "...", "content": "...", "emoji": "✨"}], "quiz": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0}]}`;
                 const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                   method: 'POST',
                   body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
                 });
                 const resData = await response.json();
                 const data = JSON.parse(resData.candidates[0].content.parts[0].text);
                 setStudyData(data);
                 await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'history'), {
                   title: subject,
                   data: data,
                   timestamp: serverTimestamp()
                 });
                 updateXP(50);
                 setView('study_view');
               } catch (e) { console.error(e); } finally { setLoading(false); }
            }}>Lançar Magia de Estudo</Button3D>
          </Card>
        )}

        {/* Revisões */}
        {view === 'revisions' && (
          <div className="max-w-3xl mx-auto space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black flex items-center gap-3"><RefreshCcw /> Suas Revisões</h2>
            {history.length === 0 ? (
              <p className="text-center p-20 text-slate-300 font-black">Ainda não tens estudos para rever!</p>
            ) : (
              history.map(item => (
                <Card key={item.id} className="flex justify-between items-center group" onClick={() => { setStudyData(item.data); setSubject(item.title); setView('study_view'); }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-all"><BookOpen className="text-slate-400 group-hover:text-indigo-500" /></div>
                    <div>
                      <h4 className="font-black text-lg">{item.title}</h4>
                      <p className="text-xs font-bold text-slate-400">{item.timestamp?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:translate-x-1" />
                </Card>
              ))
            )}
          </div>
        )}

        {/* Study View (Resumo + Quiz) */}
        {view === 'study_view' && studyData && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex bg-white p-1 rounded-2xl border shadow-sm w-fit mx-auto">
              <button onClick={() => setQuizState({...quizState, finished: false})} className="px-6 py-2 rounded-xl font-black text-xs bg-indigo-600 text-white">CONTEÚDO</button>
            </div>
            {studyData.summary.map((s, i) => (
              <Card key={i} className="border-l-8 border-l-indigo-500">
                <h3 className="text-xl font-black mb-2">{s.emoji} {s.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{s.content}</p>
              </Card>
            ))}
            <Button3D className="w-full" color="green" onClick={() => setView('dashboard')}>Marcar como Revisto</Button3D>
          </div>
        )}

      </main>

      {loading && (
        <div className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <RefreshCcw className="animate-spin" size={20} />
          <span className="text-xs font-black uppercase tracking-widest">A processar...</span>
        </div>
      )}
    </div>
  );
}

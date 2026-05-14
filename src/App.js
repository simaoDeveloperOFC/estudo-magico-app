import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BookOpen, Camera, Upload, Brain, CheckCircle, 
  ChevronRight, Sparkles, Image as ImageIcon, 
  Trophy, AlertTriangle, Play, Trash2, Globe,
  Flame, History, Crown, Target, Zap, LayoutDashboard,
  Bell, Clock, Settings, X, MessageCircle, LogIn, RefreshCcw,
  Mail, User, ShieldCheck, Languages, Paperclip, GraduationCap, MapPin, ListChecks,
  Plus, Search, Bookmark, ClipboardList,
  FileText, Sword, Timer, HeartPulse, Download, Star, Award, ExternalLink, ShieldAlert,
  BarChart3, Users, Send, Eye, Ban, CameraOff, ShoppingCart, MessageSquare, Bot, UserPlus, Fingerprint,
  Link as LinkIcon, Lock, Megaphone, Coins
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  GoogleAuthProvider, signInWithPopup, updateProfile
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, query, getDocs, writeBatch,
  where, limit, orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2HOMgI15hXf-0YhceNWmj9dppl1sXi8s", 
  authDomain: "estudo-magico-3276c.firebaseapp.com",
  projectId: "estudo-magico-3276c",
  storageBucket: "estudo-magico-3276c.firebasestorage.app",
  messagingSenderId: "17316174654",
  appId: "1:17316174654:web:a98e122832c2f0b44cea6f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'estudo-magico-pro'; 

const ADMIN_EMAILS = ['simaopereira953@gmail.com', 'Henrique.xaves2013@gmail.com'];

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
  const [authError, setAuthError] = useState('');
  const [view, setView] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); 
  const [globalMessage, setGlobalMessage] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  
  const [studyData, setStudyData] = useState({ 
    subject: '', 
    content: '', 
    result: null, 
    type: 'quiz', 
    images: [] // Para matrizes e resumos
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', country: 'Portugal', grade: '10.º Ano' });
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderCategory, setLeaderCategory] = useState('xp');

  const isAdmin = useMemo(() => profile && ADMIN_EMAILS.includes(profile.email), [profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Perfil e Presença
    const profRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile');
    const unsubProf = onSnapshot(profRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        // Atualizar presença no Firestore para contagem online
        updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'leaderboard', user.uid), {
          lastActive: Date.now(),
          xp: data.xp || 0,
          coins: data.coins || 0,
          level: data.level || 1,
          name: data.name
        });
      } else {
        const initialProfile = {
          uid: user.uid,
          name: user.displayName || "Explorador",
          email: user.email,
          country: 'Portugal',
          grade: '10.º Ano',
          xp: 0,
          level: 1,
          coins: 100,
          xpMultiplier: 1,
          coinMultiplier: 1,
          activeTitle: 'Novato',
          titles: ['Novato'],
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp()
        };
        setDoc(profRef, initialProfile);
      }
      setLoading(false);
    });

    // Mensagens Globais (Desaparecem após 8s)
    const announceRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'announcements', 'current');
    const unsubAnnounce = onSnapshot(announceRef, (snap) => {
      if (snap.exists()) {
        setGlobalMessage(snap.data());
        setTimeout(() => setGlobalMessage(null), 8000);
      }
    });

    // Leaderboard e Contagem Online
    const leaderQuery = collection(db, 'artifacts', APP_ID, 'public', 'data', 'leaderboard');
    const unsubLeader = onSnapshot(leaderQuery, (snap) => {
      const usersData = snap.docs.map(d => d.data());
      setAllUsers(usersData);
      setLeaderboard(usersData);
      
      // Contar online (ativos nos últimos 5 minutos)
      const now = Date.now();
      const online = usersData.filter(u => now - (u.lastActive || 0) < 300000).length;
      setOnlineCount(online);
    });

    return () => { unsubProf(); unsubAnnounce(); unsubLeader(); };
  }, [user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setAuthError("Erro Google: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        const initialProfile = {
          uid: cred.user.uid,
          name: authForm.name,
          email: authForm.email,
          country: authForm.country,
          grade: authForm.grade,
          xp: 0,
          level: 1,
          coins: 100,
          xpMultiplier: 1,
          coinMultiplier: 1,
          activeTitle: 'Novato',
          titles: ['Novato'],
          photoURL: '',
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', cred.user.uid, 'settings', 'profile'), initialProfile);
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateStudy = async (type = 'quiz') => {
    if (!studyData.subject || !studyData.content) return;
    setIsGenerating(true);
    try {
      const apiKey = ""; 
      const prompt = `Atua como um explicador de elite. 
      Tema: "${studyData.subject}". 
      Conteúdo: "${studyData.content}". 
      Gera um ${type === 'test' ? 'TESTE FORMATIVO com 5 perguntas difíceis' : 'QUIZ RÁPIDO com 3 perguntas'}.
      ${studyData.images.length > 0 ? "O aluno anexou imagens de matrizes/resumos, foca-te no essencial dessas imagens." : ""}
      Responde apenas em JSON: {"resumo": "Explicação clara", "quiz": [{"p": "pergunta", "options": ["a", "b", "c"], "correct": 0}]}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      setStudyData(prev => ({ ...prev, result: parsed, type }));
      
      const gainXP = 50 * (profile?.xpMultiplier || 1);
      const gainCoins = 20 * (profile?.coinMultiplier || 1);
      
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile'), { 
        xp: (profile.xp || 0) + gainXP, 
        coins: (profile.coins || 0) + gainCoins,
        level: Math.floor(((profile.xp || 0) + gainXP) / 500) + 1 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentInput || !profile) return;
    const userMsg = { role: 'user', text: currentInput };
    setChatMessages([...chatMessages, userMsg]);
    const q = currentInput;
    setCurrentInput('');
    try {
      const apiKey = ""; 
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: `Explica ao aluno ${profile.name} (Nível ${profile.level}): ${q}` }] }] 
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'bot', text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro na conexão." }]);
    } catch (e) { 
      setChatMessages(prev => [...prev, { role: 'bot', text: "Erro de ligação." }]); 
    }
  };

  const Sidebar = () => (
    <header className="bg-white border-b sticky top-0 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative group">
          {profile?.photoURL ? (
            <img src={profile.photoURL} className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-md" alt="pfp" />
          ) : (
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24}/></div>
          )}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg block leading-none">{profile?.name}</span>
            <div className="flex items-center gap-1 bg-amber-100 px-1.5 py-0.5 rounded-lg border border-amber-200">
              <Coins size={12} className="text-amber-600"/>
              <span className="text-[10px] font-black text-amber-700">{profile?.coins || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{profile?.activeTitle}</span>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">Lvl {profile?.level}</span>
          </div>
        </div>
      </div>
      <nav className="flex gap-1 bg-slate-50 p-1.5 rounded-2xl border">
        <button onClick={() => setView('dashboard')} className={`p-2 rounded-xl transition-all ${view === 'dashboard' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}><LayoutDashboard size={18}/></button>
        <button onClick={() => setView('daily')} className={`p-2 rounded-xl transition-all ${view === 'daily' ? 'bg-white shadow text-blue-500' : 'text-slate-400 hover:text-blue-400'}`}><BookOpen size={18}/></button>
        <button onClick={() => setView('chat')} className={`p-2 rounded-xl transition-all ${view === 'chat' ? 'bg-white shadow text-emerald-500' : 'text-slate-400 hover:text-emerald-400'}`}><MessageSquare size={18}/></button>
        <button onClick={() => setView('shop')} className={`p-2 rounded-xl transition-all ${view === 'shop' ? 'bg-white shadow text-amber-500' : 'text-slate-400 hover:text-amber-400'}`}><ShoppingCart size={18}/></button>
        <button onClick={() => setView('leaderboard')} className={`p-2 rounded-xl transition-all ${view === 'leaderboard' ? 'bg-white shadow text-purple-500' : 'text-slate-400 hover:text-purple-400'}`}><Crown size={18}/></button>
        <button onClick={() => setView('missions')} className={`p-2 rounded-xl transition-all ${view === 'missions' ? 'bg-white shadow text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}><Target size={18}/></button>
        {isAdmin && <button onClick={() => setView('admin')} className={`p-2 rounded-xl transition-all ${view === 'admin' ? 'bg-white shadow text-rose-600' : 'text-slate-400 hover:text-rose-600'}`}><ShieldAlert size={18}/></button>}
        <button onClick={() => setView('settings')} className={`p-2 rounded-xl transition-all ${view === 'settings' ? 'bg-white shadow text-slate-500' : 'text-slate-400 hover:text-slate-600'}`}><Settings size={18}/></button>
      </nav>
    </header>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center p-6">
        <Card className="max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-1">Estudo Mágico</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">O Teu Sucesso Começa Aqui</p>
          </div>
          <div className="space-y-3">
            {authMode === 'signup' && <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Nome Completo" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />}
            <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" placeholder="E-mail" type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" type="password" placeholder="Palavra-passe" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            {authError && <p className="text-rose-500 text-[10px] font-black text-center uppercase">{authError}</p>}
            <Button3D className="w-full h-14" color="blue" onClick={handleAuth} disabled={loading}>{authMode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}</Button3D>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-white px-2 text-slate-400">Ou continua com</span></div>
            </div>
            
            <button onClick={handleGoogleSignIn} className="w-full py-3 px-4 bg-white border-2 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.78-3.78C18.53 1.18 15.54 0 12 0 7.31 0 3.25 2.69 1.18 6.59l4.41 3.42c1.04-3.12 3.96-5.39 6.41-5.39z"/><path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.67-.21-2.46H12v4.66h6.44c-.28 1.48-1.12 2.74-2.38 3.58v2.97h3.85c2.25-2.07 3.58-5.12 3.58-8.75z"/><path fill="#FBBC05" d="M5.59 14.59c-.27-.81-.42-1.67-.42-2.59 0-.92.15-1.78.42-2.59L1.18 6.59C.43 8.24 0 10.07 0 12s.43 3.76 1.18 5.41l4.41-3.41z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.85-2.97c-1.09.73-2.49 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-4.99l-4.41 3.41C3.25 21.31 7.31 24 12 24z"/></svg>
              Google
            </button>
          </div>
          <button className="w-full text-center text-xs font-black text-slate-500 uppercase tracking-tighter" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
            {authMode === 'login' ? 'Não tens conta? Regista-te agora' : 'Já tens conta? Faz login'}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      {globalMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 animate-bounce">
          <Megaphone size={18}/> {globalMessage.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 space-y-8 pb-24">
        
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card onClick={() => setView('daily')} className="border-b-4 border-blue-500 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3"><BookOpen/></div>
                <h3 className="font-black text-lg">Modo Estudo</h3>
                <p className="text-xs text-slate-400 font-bold">Resumos e Quizzes</p>
              </Card>
              <Card onClick={() => setView('chat')} className="border-b-4 border-emerald-500 hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-3"><Bot/></div>
                <h3 className="font-black text-lg">Mestre IA</h3>
                <p className="text-xs text-slate-400 font-bold">Dúvidas 24/7</p>
              </Card>
              <Card onClick={() => setView('missions')} className="border-b-4 border-rose-500 hover:-translate-y-1">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-3"><Target/></div>
                <h3 className="font-black text-lg">Missões</h3>
                <p className="text-xs text-slate-400 font-bold">Ganha Recompensas</p>
              </Card>
              <Card className="border-b-4 border-amber-500">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-3"><Coins/></div>
                <h3 className="font-black text-lg">{profile?.coins || 0} Moedas</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase">Boost XP: {profile?.xpMultiplier}x</p>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-2 space-y-4">
                 <h2 className="text-xl font-black flex items-center gap-2"><Zap className="text-amber-500"/> Notícias da Academia</h2>
                 <div className="space-y-3">
                   <div className="p-4 bg-slate-50 rounded-2xl border flex items-center gap-4">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black">!</div>
                     <p className="text-sm font-bold text-slate-600">A nova temporada de exames começou! Usa o Modo Teste para te preparares.</p>
                   </div>
                 </div>
               </Card>
               <Card className="space-y-4">
                 <h2 className="text-xl font-black flex items-center gap-2"><Users className="text-blue-500"/> Online Agora</h2>
                 <div className="text-4xl font-black text-indigo-600">{onlineCount}</div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estudantes Ativos</p>
               </Card>
            </div>
          </div>
        )}

        {view === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h2 className="text-2xl font-black">Área de Estudo {studyData.type === 'test' ? '🏆 MODO TESTE' : ''}</h2>
              <input className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-blue-500 outline-none" placeholder="Disciplina / Tema" value={studyData.subject} onChange={e => setStudyData({...studyData, subject: e.target.value})} />
              <textarea className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold h-40 focus:border-blue-500 outline-none" placeholder="Cola aqui os teus apontamentos..." value={studyData.content} onChange={e => setStudyData({...studyData, content: e.target.value})} />
              
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase text-center">Anexar Imagens (Matriz/Resumos)</p>
                 <div className="flex gap-2 justify-center">
                    <button onClick={() => {
                      const url = prompt("URL da imagem do resumo/matriz:");
                      if(url) setStudyData(prev => ({...prev, images: [...prev.images, url]}));
                    }} className="p-3 bg-white border rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600"><ImageIcon size={20}/></button>
                 </div>
                 {studyData.images.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto pb-2">
                      {studyData.images.map((img, i) => (
                        <div key={i} className="relative w-12 h-12 shrink-0">
                          <img src={img} className="w-full h-full object-cover rounded-lg border" />
                          <button onClick={() => setStudyData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"><X size={10}/></button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="flex gap-2">
                <Button3D className="flex-1" color="blue" onClick={() => generateStudy('quiz')} disabled={isGenerating}>MODO QUIZ</Button3D>
                <Button3D className="flex-1" color="rose" onClick={() => generateStudy('test')} disabled={isGenerating}>MODO TESTE</Button3D>
              </div>
            </Card>
            
            <div className="space-y-4">
              {studyData.result ? (
                <Card className="prose animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black flex items-center gap-2 text-indigo-600"><Sparkles/> {studyData.type === 'test' ? 'Matriz e Teste Prático' : 'Resumo Mágico'}</h3>
                    <button onClick={() => setStudyData({...studyData, result: null})} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
                  </div>
                  <div className="text-sm font-medium text-slate-600 leading-relaxed py-4 border-b">
                    {studyData.result.resumo}
                  </div>
                  <div className="mt-4 space-y-4">
                    {studyData.result.quiz.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border-2 border-white shadow-sm">
                        <p className="font-black text-xs mb-3 text-slate-700">{i+1}. {q.p}</p>
                        <div className="grid gap-2">
                          {q.options.map((o, oi) => (
                            <button key={oi} onClick={() => alert(oi === q.correct ? "Mágico! Acertaste." : "Quase! Tenta de novo.")} className="text-left p-3 bg-white border-2 border-slate-100 rounded-xl text-[11px] font-bold hover:border-indigo-300 hover:bg-indigo-50 transition-all">{o}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="h-full border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-200 p-10 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Brain size={48} className="opacity-20"/></div>
                  <p className="font-black uppercase text-xs tracking-widest">Insere o tema para gerar magia</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'missions' && (
          <div className="max-w-3xl mx-auto space-y-6">
             <h2 className="text-3xl font-black flex items-center gap-2"><Target className="text-rose-500"/> Missões Diárias</h2>
             <div className="grid gap-4">
               {[
                 { title: "Mestre do Quiz", desc: "Completa 3 quizzes hoje", reward: "50 Moedas", progress: 0, total: 3 },
                 { title: "Sempre a Aprender", desc: "Gera um Modo Teste difícil", reward: "100 Moedas", progress: 1, total: 1 },
                 { title: "Socializador", desc: "Fala com o Mestre IA", reward: "20 XP", progress: 0, total: 1 },
               ].map((m, i) => (
                 <Card key={i} className="flex items-center justify-between">
                   <div className="space-y-1">
                     <h4 className="font-black text-slate-800">{m.title}</h4>
                     <p className="text-xs font-bold text-slate-400">{m.desc}</p>
                     <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-rose-500" style={{width: `${(m.progress/m.total)*100}%`}}></div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-black text-rose-500 uppercase">{m.reward}</div>
                     <Button3D color="white" disabled={m.progress < m.total} className="mt-2 py-1.5 px-4 text-[10px]">RECLAMAR</Button3D>
                   </div>
                 </Card>
               ))}
             </div>
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black text-center">Top Alunos</h2>
            <div className="flex gap-2 justify-center">
               <button onClick={() => setLeaderCategory('xp')} className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${leaderCategory === 'xp' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>Por XP</button>
               <button onClick={() => setLeaderCategory('coins')} className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${leaderCategory === 'coins' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>Por Moedas</button>
               <button onClick={() => setLeaderCategory('level')} className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${leaderCategory === 'level' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400'}`}>Por Nível</button>
            </div>
            <Card className="p-0 overflow-hidden shadow-xl">
              {leaderboard.sort((a,b) => (b[leaderCategory] || 0) - (a[leaderCategory] || 0)).map((p, i) => (
                <div key={p.uid} className={`flex items-center justify-between p-4 border-b last:border-none transition-all ${p.uid === user.uid ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-black w-8 text-center ${i === 0 ? 'text-amber-500 text-xl' : i === 1 ? 'text-slate-400 text-lg' : i === 2 ? 'text-amber-700' : 'text-slate-300'}`}>#{i+1}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border shadow-sm">
                      {p.photoURL ? <img src={p.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300"><User size={18}/></div>}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">{p.name}</div>
                      <div className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">{p.activeTitle || 'Novato'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-indigo-600">
                      {leaderCategory === 'xp' && `${p.xp || 0} XP`}
                      {leaderCategory === 'coins' && `${p.coins || 0} Moedas`}
                      {leaderCategory === 'level' && `Lvl ${p.level || 1}`}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-3xl font-black text-rose-600 flex items-center gap-2"><ShieldAlert/> Painel Supremo de Admin</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="space-y-4 border-rose-200">
                <h3 className="font-black text-lg flex items-center gap-2 text-rose-600"><Megaphone size={20}/> Anúncio Global</h3>
                <textarea id="globalMsg" className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold focus:border-rose-500 outline-none h-24" placeholder="Esta mensagem aparecerá para todos por 8 segundos..." />
                <Button3D className="w-full" color="rose" onClick={() => {
                  const val = document.getElementById('globalMsg').value;
                  if(val) setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'announcements', 'current'), { text: val, sender: profile.name, ts: Date.now() });
                }}>PROPAGAR AVISO</Button3D>
              </Card>

              <Card className="space-y-4">
                <h3 className="font-black text-lg flex items-center gap-2 text-slate-700"><Users size={20}/> Controlo de Utilizadores</h3>
                <select id="targetUser" className="w-full p-3 bg-slate-50 border-2 rounded-xl font-bold focus:border-slate-400 outline-none">
                   <option value="">Escolher Aluno...</option>
                   {allUsers.map(u => (
                     <option key={u.uid} value={u.uid}>{u.name} (Lvl {u.level})</option>
                   ))}
                </select>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2">
                    <input id="abuseValue" type="number" className="w-24 p-2 border rounded-xl font-bold" placeholder="Valor" />
                    <Button3D className="flex-1 py-2 text-xs" color="slate" onClick={() => {
                      const uid = document.getElementById('targetUser').value;
                      const val = parseInt(document.getElementById('abuseValue').value);
                      if(uid && val) updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid, 'settings', 'profile'), { xp: val });
                    }}>SET XP</Button3D>
                  </div>
                  <div className="flex gap-2">
                    <input id="abuseCoins" type="number" className="w-24 p-2 border rounded-xl font-bold" placeholder="Valor" />
                    <Button3D className="flex-1 py-2 text-xs" color="slate" onClick={() => {
                      const uid = document.getElementById('targetUser').value;
                      const val = parseInt(document.getElementById('abuseCoins').value);
                      if(uid && val) updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid, 'settings', 'profile'), { coins: val });
                    }}>SET MOEDAS</Button3D>
                  </div>
                  <div className="flex gap-2">
                    <input id="xpMult" type="number" step="0.1" className="w-24 p-2 border rounded-xl font-bold" placeholder="X" />
                    <Button3D className="flex-1 py-2 text-xs" color="purple" onClick={() => {
                      const uid = document.getElementById('targetUser').value;
                      const val = parseFloat(document.getElementById('xpMult').value);
                      if(uid && val) updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid, 'settings', 'profile'), { xpMultiplier: val });
                    }}>MULT XP</Button3D>
                  </div>
                  <div className="flex gap-2">
                    <input id="coinMult" type="number" step="0.1" className="w-24 p-2 border rounded-xl font-bold" placeholder="X" />
                    <Button3D className="flex-1 py-2 text-xs" color="amber" onClick={() => {
                      const uid = document.getElementById('targetUser').value;
                      const val = parseFloat(document.getElementById('coinMult').value);
                      if(uid && val) updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid, 'settings', 'profile'), { coinMultiplier: val });
                    }}>MULT COINS</Button3D>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-md mx-auto space-y-6">
            <Card className="text-center p-8 space-y-6 shadow-xl">
              <div className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full bg-slate-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-4 ring-indigo-50">
                  {profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover" /> : <User size={50} className="text-slate-300"/>}
                </div>
                <button onClick={() => {
                  const url = prompt("URL da tua nova foto de perfil:");
                  if(url) updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile'), { photoURL: url });
                }} className="absolute bottom-1 right-1 bg-white p-2.5 rounded-2xl shadow-lg border-2 border-indigo-50 hover:bg-slate-50 transition-all text-indigo-600"><Camera size={18}/></button>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{profile?.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{profile?.email}</p>
              </div>

              <div className="space-y-3 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Título Ativo</label>
                  <select className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm focus:border-indigo-500 outline-none" value={profile?.activeTitle} onChange={e => updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile'), { activeTitle: e.target.value })}>
                    {profile?.titles?.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button3D color="rose" className="w-full" onClick={() => signOut(auth)}>TERMINAR SESSÃO</Button3D>
                <p className="text-[10px] font-bold text-slate-300 uppercase">Estudo Mágico Pro v2.5 — Feito com Magia</p>
              </div>
            </Card>
          </div>
        )}

      </main>
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-4 animate-bounce">
              <Sparkles className="text-white" size={40}/>
           </div>
           <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">A carregar o teu destino...</p>
        </div>
      )}
    </div>
  );
}

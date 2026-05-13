import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BookOpen, Camera, Upload, Brain, CheckCircle, Trophy, Flame, History, MessageCircle, 
  Mail, User, GraduationCap, Plus, Sword, Zap, Globe, Send, ShieldAlert, Settings, X, 
  LogOut, Search, Clock, Target, Rocket, Award, LayoutDashboard, Bell, Ghost, 
  Star, ChevronRight, Hash, ShieldCheck, Flag, Languages, MapPin, Eye, Trash2, Sparkles,
  ZapOff, Shield, BarChart3, Fingerprint, Activity, Terminal
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE ---
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, 
  orderBy, limit, serverTimestamp, updateDoc, addDoc, where, deleteDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2HOMgI15hXf-0YhceNWmj9dppl1sXi8s",
  authDomain: "estudo-magico-3276c.firebaseapp.com",
  projectId: "estudo-magico-3276c",
  storageBucket: "estudo-magico-3276c.appspot.com",
  messagingSenderId: "17316174654",
  appId: "1:17316174654:web:a98e122832c2f0b44cea6f",
  measurementId: "G-Q4BEFNJZC8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// --- COMPONENTES DE UI PROFISSIONAIS ---

const GlassCard = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200/50 shadow-xl transition-all duration-500 ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1 active:scale-95' : ''} ${className}`}>
    {children}
  </div>
);

const AdminBadge = () => (
  <div className="flex items-center gap-1.5 bg-rose-100 text-rose-600 px-3 py-1 rounded-full border border-rose-200">
    <Shield size={12} className="fill-rose-600" />
    <span className="text-[10px] font-black uppercase tracking-tighter">System Admin</span>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function EstudoMagicoPro() {
  // 🔐 Estados de Segurança e Autenticação
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState('loading');
  
  // 📝 Estados de Registo e Validação
  const [regStep, setRegStep] = useState(1);
  const [regError, setRegError] = useState(null);
  const [regForm, setRegForm] = useState({
    name: '', displayName: '', email: '', 
    grade: '7.º Ano', country: 'Portugal', language: 'Português'
  });
  const [verification, setVerification] = useState({ code: '', generated: null, attempts: 0 });

  // 🎮 Estados da Arena e Gamificação
  const [arenaState, setArenaState] = useState({ active: false, score: 0, multiplier: 1, streak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  
  // 🤖 Estados do Tutor IA e Chat
  const [chat, setChat] = useState({
    messages: [{ role: 'ai', text: 'Bem-vindo ao centro de comando de estudo, Simão. 🤖 O que vamos conquistar hoje?' }],
    input: '',
    isTyping: false
  });

  // 📢 Notificações e Sistema
  const [notifications, setNotifications] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // --- LÓGICA DE INICIALIZAÇÃO ---

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            setView('dashboard');
            addLog("Perfil carregado com sucesso.");
          } else {
            setView('onboarding');
          }
        } catch (err) {
          addLog("Erro ao aceder à base de dados: " + err.message);
        }
      } else {
        signInAnonymously(auth).catch(e => addLog("Falha no Login Anónimo: " + e.message));
      }
      setIsAuthLoading(false);
    });

    const unsubLeader = onSnapshot(
      query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10)),
      (snap) => setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubAuth(); unsubLeader(); };
  }, []);

  // --- UTILITÁRIOS ---

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleRegUpdate = (field, val) => {
    setRegForm(prev => ({ ...prev, [field]: val }));
    setRegError(null);
  };

  // --- ACTIONS ---

  const startRegistration = () => {
    if (regForm.name.length < 3) return setRegError("Nome demasiado curto ❌");
    if (!regForm.email.includes('@')) return setRegError("Email inválido ❌");
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerification(prev => ({ ...prev, generated: code }));
    setRegStep(2);
    addLog(`Código gerado para ${regForm.email}`);
    alert(`🔐 CÓDIGO DE ACESSO: ${code}`);
  };

  const finalizeAccount = async () => {
    if (verification.code !== verification.generated) {
      setVerification(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      return alert("Código Errado! Tentativa " + (verification.attempts + 1));
    }

    setIsAuthLoading(true);
    try {
      const isAdmin = regForm.email.toLowerCase() === 'simaopereira953@gmail.com';
      const newProfile = {
        ...regForm,
        xp: 100,
        level: 1,
        coins: 200,
        isAdmin,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        inventory: ['Badge de Fundador'],
        stats: { questions: 0, wins: 0, scans: 0 }
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      setRegStep(3);
      addLog("Nova conta criada para: " + regForm.displayName);
    } catch (e) {
      alert("Erro crítico: " + e.message);
    }
    setIsAuthLoading(false);
  };

  const sendGlobalAlert = async (msg) => {
    if (!profile?.isAdmin) return;
    await addDoc(collection(db, 'announcements'), {
      msg,
      sender: profile.displayName,
      time: serverTimestamp(),
      priority: true
    });
    addLog("Aviso global enviado.");
  };

  // --- RENDERS ---

  if (view === 'loading' || isAuthLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={32} />
        </div>
        <p className="text-indigo-400 font-black tracking-widest uppercase animate-pulse">A inicializar sistemas...</p>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <GlassCard className="max-w-2xl w-full bg-slate-900/50 border-slate-800 p-12">
          {regStep === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-500/20">
                   <Rocket size={48} className="animate-bounce" />
                </div>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase">Novo Recruta 🛡️</h2>
                <p className="text-slate-400 font-bold">Configura o teu acesso ao Estudo Mágico V3.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Nome Real" val={regForm.name} change={v => handleRegUpdate('name', v)} icon={User} />
                <InputGroup label="Display Name" val={regForm.displayName} change={v => handleRegUpdate('displayName', v)} icon={Fingerprint} />
                <div className="md:col-span-2">
                  <InputGroup label="Email de Estudante" val={regForm.email} change={v => handleRegUpdate('email', v)} icon={Mail} />
                </div>
                <SelectGroup label="Ano Escolar" val={regForm.grade} change={v => handleRegUpdate('grade', v)} options={['7.º Ano', '8.º Ano', '9.º Ano']} icon={GraduationCap} />
                <InputGroup label="País" val={regForm.country} change={v => handleRegUpdate('country', v)} icon={Globe} />
              </div>

              {regError && <p className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-center font-black text-sm border border-rose-500/20">{regError}</p>}

              <button 
                onClick={startRegistration}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black text-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                GERAR CÓDIGO DE ACESSO <ChevronRight />
              </button>
            </div>
          )}

          {regStep === 2 && (
            <div className="text-center space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <ShieldCheck size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">Verifica o teu Email 📧</h3>
                <p className="text-slate-400 font-bold">Introduz o código que enviámos para <span className="text-indigo-400">{regForm.email}</span></p>
              </div>
              <input 
                className="w-full bg-slate-800/50 border-2 border-slate-700 p-8 rounded-[2.5rem] text-center text-6xl font-black tracking-[1rem] outline-none focus:border-indigo-500 transition-all"
                maxLength={6}
                placeholder="000000"
                onChange={e => setVerification(prev => ({ ...prev, code: e.target.value }))}
              />
              <div className="flex flex-col gap-4">
                <button onClick={finalizeAccount} className="w-full bg-emerald-600 py-6 rounded-3xl font-black text-xl shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95">VALIDAR CONTA ✅</button>
                <button onClick={() => setRegStep(1)} className="text-slate-500 font-bold hover:text-white transition-colors">Alterar dados de registo</button>
              </div>
            </div>
          )}

          {regStep === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in-90">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                  <CheckCircle size={64} />
                </div>
                <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={40} />
              </div>
              <h2 className="text-6xl font-black italic uppercase tracking-tighter">CONTA ATIVA! 🎊</h2>
              <p className="text-xl text-slate-400 font-bold">Bem-vindo à elite do 7.º Ano, {regForm.displayName}.</p>
              <button onClick={() => window.location.reload()} className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-xl hover:bg-slate-100 active:scale-95 transition-all">COMEÇAR A ESTUDAR 🚀</button>
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 🌌 Dashboard Moderno Centrado */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:rotate-12 transition-transform">
              <Terminal size={26} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl italic uppercase tracking-tighter leading-none">Estudo Mágico</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-500/30 uppercase">Build 2026.5</span>
                {profile.isAdmin && <AdminBadge />}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-6 bg-slate-900/50 border border-slate-800 px-6 py-2.5 rounded-2xl mr-4">
                <div className="flex items-center gap-2">
                  <Flame className="text-orange-500" size={18} />
                  <span className="font-black text-sm">{profile.xp} XP</span>
                </div>
                <div className="w-px h-4 bg-slate-800" />
                <div className="flex items-center gap-2">
                  <Zap className="text-amber-400" size={18} />
                  <span className="font-black text-sm">{profile.coins}</span>
                </div>
             </div>

             {profile.isAdmin && (
               <button onClick={() => setView('admin')} className={`p-3.5 rounded-2xl transition-all border ${view === 'admin' ? 'bg-rose-600 border-rose-500 shadow-lg shadow-rose-600/20' : 'bg-slate-900 border-slate-800 hover:border-rose-500 text-rose-500'}`}>
                 <ShieldAlert size={22} />
               </button>
             )}

             <button className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all relative">
                <Bell size={22} />
                <div className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 border-2 border-slate-950 rounded-full" />
             </button>

             <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <User size={24} className="text-slate-400" />
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-40 px-6">
        
        {view === 'dashboard' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
             
             {/* Header Section */}
             <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                   <h2 className="text-7xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8] text-white">VAMOS LÁ,<br/>{profile.displayName.split(' ')[0]} ⚡</h2>
                   <p className="text-2xl font-bold text-slate-500 max-w-xl italic">A tua inteligência artificial está pronta para otimizar o teu estudo do {profile.grade}.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <button 
                    onClick={() => setView('arena')}
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-6 rounded-[2rem] font-black text-2xl italic uppercase tracking-tight shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-4">
                    <Sword size={28} /> ENTRAR NA ARENA
                   </button>
                </div>
             </section>

             {/* Functional Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                  title="Scanner IA" 
                  desc="Converte o teu caderno em resumos" 
                  icon={Camera} 
                  color="bg-blue-600" 
                  sub="Disponível 📸"
                />
                <FeatureCard 
                  title="Biblioteca" 
                  desc="Revê os teus conteúdos salvos" 
                  icon={BookOpen} 
                  color="bg-emerald-600" 
                  sub="24 Ficheiros 📖"
                />
                <div className="lg:col-span-2 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col h-full justify-between space-y-12">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Objetivo Semanal 🎯</h3>
                            <p className="text-slate-500 font-bold">Domina a Matemática do 7º Ano</p>
                         </div>
                         <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl font-black text-sm">XP x3 ATIVO</div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between font-black text-xs uppercase tracking-widest text-slate-400">
                            <span>Progresso do Nível {profile.level}</span>
                            <span className="text-indigo-400">750 / 1000 XP</span>
                         </div>
                         <div className="h-6 bg-slate-950 rounded-full border border-slate-800 p-1.5">
                            <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-1000" style={{ width: '75%' }} />
                         </div>
                      </div>
                   </div>
                   <Activity className="absolute -right-20 -bottom-20 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" size={350} />
                </div>
             </div>

             {/* Secondary Content Row */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* 🏆 Leaderboard Profissional */}
                <div className="lg:col-span-2 bg-slate-900/30 rounded-[3rem] border border-slate-800/50 p-10">
                   <div className="flex justify-between items-center mb-12">
                      <div className="flex items-center gap-5">
                         <div className="p-4 bg-amber-500/10 text-amber-500 rounded-3xl border border-amber-500/20">
                            <Trophy size={32} />
                         </div>
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Top Estudantes {profile.country}</h3>
                      </div>
                      <button className="text-slate-500 font-black hover:text-white transition-colors text-sm uppercase tracking-widest">Ver Todos</button>
                   </div>

                   <div className="space-y-4">
                      {leaderboard.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4 text-slate-600">
                           <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                           <p className="font-black uppercase tracking-widest text-xs">Sincronizando Ranking...</p>
                        </div>
                      ) : (
                        leaderboard.map((u, i) => (
                          <div key={u.id} className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all ${u.id === user.uid ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.02]' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                             <div className="flex items-center gap-8">
                                <span className={`text-2xl font-black italic ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>#{i+1}</span>
                                <div className="flex items-center gap-4">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${u.id === user.uid ? 'bg-white text-indigo-600 border-white' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                      {u.displayName[0].toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="font-black text-xl tracking-tight leading-none">{u.displayName}</p>
                                      <p className={`text-[10px] font-black uppercase mt-1 tracking-widest ${u.id === user.uid ? 'text-indigo-200' : 'text-slate-500'}`}>{u.grade} • {u.country}</p>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <p className="text-2xl font-black leading-none">{u.xp.toLocaleString()}</p>
                                   <p className={`text-[10px] font-black uppercase mt-1 ${u.id === user.uid ? 'text-indigo-200' : 'text-slate-500'}`}>XP MÁGICO</p>
                                </div>
                                <ChevronRight className={u.id === user.uid ? 'text-white/40' : 'text-slate-700'} />
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* 🤖 Terminal IA */}
                <div className="flex flex-col gap-8">
                   <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
                      <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Brain size={24} />
                         </div>
                         <div>
                            <h4 className="font-black text-lg text-white leading-none uppercase italic">Tutor IA Estudo</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Core V3 Online</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                         {chat.messages.map((m, i) => (
                           <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[90%] p-6 rounded-[2rem] font-bold text-sm leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                 {m.text}
                              </div>
                              <span className="text-[9px] font-black uppercase text-slate-600 mt-2 px-2 italic tracking-widest">{m.role === 'ai' ? 'Sistema Inteligente' : 'Comando de ' + profile.displayName}</span>
                           </div>
                         ))}
                      </div>

                      <div className="p-6 bg-slate-900/80 backdrop-blur-md border-t border-slate-800">
                         <div className="flex gap-3 bg-slate-950 p-2.5 rounded-3xl border border-slate-800 focus-within:border-indigo-500 transition-all">
                            <input 
                              className="flex-1 bg-transparent px-4 font-bold text-sm text-white outline-none" 
                              placeholder="Qual é o tema de hoje?..."
                              value={chat.input}
                              onChange={e => setChat(p => ({ ...p, input: e.target.value }))}
                              onKeyPress={e => e.key === 'Enter' && handleChatSend()}
                            />
                            <button 
                              onClick={handleChatSend}
                              className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 active:scale-90 transition-all shadow-lg shadow-indigo-600/20">
                              <Send size={24} />
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Quick Actions Card */}
                   <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2.5rem] shadow-xl shadow-amber-500/10 flex items-center justify-between group cursor-pointer overflow-hidden relative">
                      <div className="relative z-10">
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Daily Bonus 🎁</h4>
                        <p className="text-amber-100 font-bold text-sm">Resgata os teus 50 XP diários!</p>
                      </div>
                      <Award size={64} className="text-white/20 group-hover:scale-110 transition-transform relative z-10" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- VIEW: ADMIN PANEL --- */}
        {view === 'admin' && profile.isAdmin && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-10 duration-500">
             <header className="flex justify-between items-center bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800">
                <div className="space-y-3">
                   <div className="flex items-center gap-4">
                      <h2 className="text-6xl font-black italic uppercase tracking-tighter text-rose-500">Master Control 🛡️</h2>
                      <AdminBadge />
                   </div>
                   <p className="text-xl font-bold text-slate-500 italic">Administrador Ativo: <span className="text-white">{profile.email}</span></p>
                </div>
                <button 
                  onClick={() => setView('dashboard')}
                  className="bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black uppercase text-sm hover:bg-slate-200 transition-all active:scale-95">
                  Sair da Consola
                </button>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <StatCard label="Total Users" val={leaderboard.length} icon={User} color="text-blue-500" />
                <StatCard label="Live Queries" val="1.4k" icon={Brain} color="text-indigo-500" />
                <StatCard label="System Load" val="12%" icon={Activity} color="text-emerald-500" />
                <StatCard label="Security Check" val="Safe" icon={ShieldCheck} color="text-rose-500" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800">
                   <h3 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Terminal size={24} /> Broadcast Global 📢</h3>
                   <div className="space-y-6">
                      <textarea 
                        id="admin_msg_text"
                        className="w-full h-40 bg-slate-950 border-2 border-slate-800 p-6 rounded-[2rem] font-bold text-white outline-none focus:border-rose-500 transition-all resize-none"
                        placeholder="Escreve a mensagem que todos os alunos vão ver no topo..."
                      />
                      <button 
                        onClick={() => {
                          const val = document.getElementById('admin_msg_text').value;
                          if(val) { sendGlobalAlert(val); document.getElementById('admin_msg_text').value = ''; }
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-500 py-6 rounded-3xl font-black text-xl shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3">
                        <Send size={20} /> ENVIAR COM PRIORIDADE
                      </button>
                   </div>
                </div>

                <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 flex flex-col h-[500px]">
                   <h3 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><History size={24} /> Registos do Sistema</h3>
                   <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-4 custom-scrollbar">
                      {systemLogs.map((log, i) => (
                        <div key={i} className="p-3 bg-slate-950 border-l-2 border-slate-700 text-slate-500 hover:border-indigo-500 transition-colors">
                           {log}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* 📱 Barra de Navegação Inferior (Mobile Pro) */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-slate-950/90 backdrop-blur-3xl border-t border-slate-800 p-6 z-[200]">
         <div className="flex justify-around items-center max-w-lg mx-auto">
            <NavIcon icon={LayoutDashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavIcon icon={Camera} active={view === 'study'} onClick={() => setView('study')} />
            <div 
              onClick={() => setView('arena')}
              className="w-20 h-20 bg-indigo-600 -mt-20 rounded-[2rem] border-[10px] border-[#0A0C10] shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all">
               <Sword size={32} />
            </div>
            <NavIcon icon={BookOpen} active={view === 'library'} onClick={() => setView('library')} />
            <NavIcon icon={profile.isAdmin ? ShieldAlert : Settings} active={view === 'admin'} onClick={() => profile.isAdmin ? setView('admin') : setView('settings')} danger={profile.isAdmin} />
         </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');
        
        body { 
          font-family: 'Space Grotesk', sans-serif; 
          background-color: #0A0C10;
          overflow-x: hidden;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}} />
    </div>
  );

  // --- HANDLERS AUXILIARES ---

  function handleChatSend() {
    if (!chat.input.trim()) return;
    const newMsg = { role: 'user', text: chat.input };
    setChat(p => ({ 
      ...p, 
      messages: [...p.messages, newMsg],
      input: '',
      isTyping: true 
    }));

    setTimeout(() => {
      let res = "Excelente pergunta sobre " + newMsg.text + ". ";
      if (newMsg.text.toLowerCase().includes('história')) {
        res += "Sabias que em Portugal o 7º ano foca muito na expansão marítima? Queres um quiz rápido?";
      } else {
        res += "Vou preparar um plano de estudo personalizado para o teu ano (" + profile.grade + ").";
      }
      setChat(p => ({ 
        ...p, 
        messages: [...p.messages, { role: 'ai', text: res }],
        isTyping: false 
      }));
    }, 1500);
  }
}

// --- SUB-COMPONENTES AUXILIARES DE ESTILO ---

const InputGroup = ({ label, val, change, icon: Icon, type = "text" }) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">
      <Icon size={12} /> {label}
    </label>
    <input 
      type={type}
      value={val}
      onChange={e => change(e.target.value)}
      className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all"
    />
  </div>
);

const SelectGroup = ({ label, val, change, options, icon: Icon }) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ml-5">
      <Icon size={12} /> {label}
    </label>
    <select 
      value={val}
      onChange={e => change(e.target.value)}
      className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon, color, sub }) => (
  <div className={`${color} p-10 rounded-[2.5rem] shadow-2xl shadow-${color.split('-')[1]}-600/20 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden`}>
    <div className="relative z-10 h-full flex flex-col justify-between space-y-16 text-white">
      <Icon size={48} className="group-hover:rotate-12 transition-transform" />
      <div>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{title}</h3>
        <p className="text-white/60 font-bold text-sm mt-1">{desc}</p>
        <div className="mt-4 bg-white/10 w-fit px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/10">{sub}</div>
      </div>
    </div>
    <Sparkles className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-white/10 transition-colors" size={180} />
  </div>
);

const StatCard = ({ label, val, icon: Icon, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] text-center space-y-2">
    <div className={`p-4 rounded-2xl bg-slate-950 w-fit mx-auto ${color} border border-slate-800`}>
       <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-4">{label}</p>
    <p className="text-4xl font-black text-white">{val}</p>
  </div>
);

const NavIcon = ({ icon: Icon, active, onClick, danger }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all ${active ? (danger ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : 'text-slate-500 hover:text-slate-300'}`}>
    <Icon size={24} />
  </button>
);

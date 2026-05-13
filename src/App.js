import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Camera, Upload, Brain, CheckCircle, Trophy, Flame, History, MessageCircle, 
  Mail, User, GraduationCap, Plus, Sword, Zap, Globe, Send, ShieldAlert, Settings, X, 
  LogOut, Search, Clock, Target, Rocket, Award, LayoutDashboard, Bell, Ghost, 
  Star, ChevronRight, Hash, ShieldCheck, Flag, Languages, MapPin, Eye, Trash2
} from 'lucide-react';

// --- INITIALIZING SERVICES (FIREBASE SIMULATION & CONFIG) ---
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, 
  orderBy, limit, serverTimestamp, updateDoc, addDoc, where, deleteDoc 
} from 'firebase/firestore';

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

// --- COMPONENTES DE INTERFACE PROFISSIONAIS (UI KIT) ---

const Card3D = ({ children, className = "", onClick, noHover = false }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm transition-all duration-300 ${!noHover && onClick ? 'cursor-pointer hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/50 active:scale-[0.98]' : ''} ${className}`}>
    {children}
  </div>
);

const Button3D = ({ children, color = "blue", onClick, disabled, className = "", icon: Icon }) => {
  const themes = {
    blue: "bg-blue-600 shadow-[0_5px_0_0_#1d4ed8] active:shadow-none",
    indigo: "bg-indigo-600 shadow-[0_5px_0_0_#4338ca] active:shadow-none",
    green: "bg-emerald-600 shadow-[0_5px_0_0_#059669] active:shadow-none",
    red: "bg-rose-600 shadow-[0_5px_0_0_#e11d48] active:shadow-none",
    dark: "bg-slate-900 shadow-[0_5px_0_0_#000000] active:shadow-none text-white",
    white: "bg-white text-slate-800 border-2 border-slate-100 shadow-[0_5px_0_0_#f1f5f9] active:shadow-none",
    orange: "bg-orange-500 shadow-[0_5px_0_0_#ea580c] active:shadow-none"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`relative flex items-center justify-center gap-2 font-black py-4 px-8 rounded-2xl transition-all active:translate-y-[5px] ${themes[color]} ${color !== 'white' && color !== 'dark' ? 'text-white' : ''} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-105'} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2 w-full">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">
      {Icon && <Icon size={12} />} {label}
    </label>
    <input 
      {...props} 
      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all" 
    />
  </div>
);

// --- APLICAÇÃO PRINCIPAL ---

export default function EstudoMagicoV3() {
  // Estados de Sessão e Perfil
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Fluxo de Registo
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: Verificação, 3: Sucesso
  const [regForm, setRegForm] = useState({ 
    name: '', displayName: '', email: '', 
    grade: '7.º Ano', language: 'Português', country: 'Portugal' 
  });
  const [vCode, setVCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);

  // Funcionalidades de Estudo e IA
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: 'Olá! Sou o teu tutor inteligente 🤖 Como posso ajudar nos teus estudos hoje?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Arena State
  const [arenaActive, setArenaActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // --- EFEITOS E LÓGICA FIREBASE ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile(snap.data());
          setView('dashboard');
        } else {
          setRegStep(1);
        }
      } else {
        signInAnonymously(auth);
      }
    });

    // Listener para Leaderboard Real (Sem utilizadores falsos)
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(15));
    const unsubLeader = onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeaderboard(users);
    });

    // Listener para Mensagens Reais do Admin
    const msgQuery = query(collection(db, 'announcements'), orderBy('timestamp', 'desc'));
    const unsubMsgs = onSnapshot(msgQuery, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubscribe(); unsubLeader(); unsubMsgs(); };
  }, []);

  // --- HANDLERS DE REGISTO ---

  const initiateRegistration = () => {
    if (!regForm.email.includes('@')) return alert("⚠️ Email inválido!");
    if (!regForm.name || !regForm.displayName) return alert("⚠️ Preenche todos os campos!");
    
    // Gerar código de verificação
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRegStep(2);
    
    // Simulação de envio de email (Alert para o Simão testar)
    console.log(`[EMAIL SYSTEM] Para: ${regForm.email} | Código: ${code}`);
    alert(`🔐 CÓDIGO DE VERIFICAÇÃO: ${code}\n(Este código foi gerado para o teu email: ${regForm.email})`);
  };

  const verifyAndCreate = async () => {
    if (vCode !== generatedCode) return alert("❌ Código incorreto. Tenta novamente!");
    
    setLoading(true);
    try {
      const isAdmin = regForm.email.trim().toLowerCase() === 'simaopereira953@gmail.com';
      const userData = {
        ...regForm,
        xp: 0,
        level: 1,
        coins: 150,
        isAdmin: isAdmin,
        joinedAt: serverTimestamp(),
        bio: `Estudante dedicado do ${regForm.grade} 🚀`,
        stats: { battles: 0, wins: 0, scans: 0 }
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setProfile(userData);
      setRegStep(3);
    } catch (e) {
      alert("Erro ao criar perfil: " + e.message);
    }
    setLoading(false);
  };

  // --- LÓGICA DO TUTOR IA ---

  const askAI = () => {
    if (!chatInput.trim()) return;
    
    const newMsgs = [...chatLog, { role: 'user', text: chatInput }];
    setChatLog(newMsgs);
    setChatInput("");

    // Lógica de resposta simulando IA contextualizada
    setTimeout(() => {
      let response = `Interessante o teu pedido sobre "${chatInput}". `;
      
      if (chatInput.toLowerCase().includes('matemática')) {
        response += `Como estás no ${profile.grade}, recomendo focar em expressões numéricas e geometria básica 📐`;
      } else if (chatInput.toLowerCase().includes('ajuda')) {
        response += `Estou aqui para explicar qualquer matéria! Podes também usar o Scan de Estudo para eu resumir o teu caderno 📸`;
      } else {
        response += `Vou analisar isso com base no currículo de ${profile.country}. Queres que eu crie um pequeno teste de 3 perguntas? 📝`;
      }

      setChatLog(prev => [...prev, { role: 'ai', text: response }]);
    }, 1200);
  };

  // --- ADMIN ACTIONS (SÓ PARA O SIMÃO) ---

  const sendGlobalAnnouncement = async (text) => {
    if (!profile?.isAdmin) return;
    await addDoc(collection(db, 'announcements'), {
      content: text,
      author: 'Admin Simão',
      timestamp: serverTimestamp(),
      type: 'priority'
    });
    alert("📢 Mensagem enviada a todos os utilizadores!");
  };

  // --- RENDERS ---

  // Tela de Registo / Onboarding
  if (!profile) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
      </div>

      <Card3D className="max-w-xl w-full relative z-10 p-10 space-y-8" noHover>
        {regStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-200">
                <Rocket size={40} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Cria o teu Avatar 🦸‍♂️</h2>
              <p className="text-slate-400 font-bold">Personaliza a tua experiência de estudo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nome Completo" placeholder="Ex: Simão Pereira" onChange={e => setRegForm({...regForm, name: e.target.value})} />
              <InputField label="Nome de Exibição" placeholder="Ex: Simao_Pro" onChange={e => setRegForm({...regForm, displayName: e.target.value})} />
              <div className="md:col-span-2">
                <InputField label="Email Verdadeiro" type="email" placeholder="teu@email.com" onChange={e => setRegForm({...regForm, email: e.target.value})} />
              </div>
              <InputField label="Ano Escolar" icon={GraduationCap} as="select" onChange={e => setRegForm({...regForm, grade: e.target.value})}>
                <option>7.º Ano</option><option>8.º Ano</option><option>9.º Ano</option>
              </InputField>
              <InputField label="País" icon={MapPin} onChange={e => setRegForm({...regForm, country: e.target.value})} placeholder="Portugal" />
              <InputField label="Língua" icon={Languages} onChange={e => setRegForm({...regForm, language: e.target.value})} placeholder="Português" />
            </div>

            <Button3D color="indigo" className="w-full" onClick={initiateRegistration} icon={ChevronRight}>
              CONTINUAR PARA VERIFICAÇÃO
            </Button3D>
          </div>
        )}

        {regStep === 2 && (
          <div className="space-y-8 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter">VERIFICA O TEU EMAIL 📧</h3>
              <p className="text-slate-500 font-bold">Enviámos um código de 6 dígitos para <span className="text-indigo-600">{regForm.email}</span>.</p>
            </div>
            <input 
              className="w-full p-6 bg-slate-50 border-4 border-slate-100 rounded-[2rem] font-black text-4xl text-center tracking-[1em] focus:border-indigo-500 outline-none transition-all"
              maxLength={6}
              placeholder="000000"
              onChange={e => setVCode(e.target.value)}
            />
            <div className="flex flex-col gap-3">
              <Button3D color="green" className="w-full py-6 text-xl" onClick={verifyAndCreate}>
                VALIDAR ACESSO ✅
              </Button3D>
              <button onClick={() => setRegStep(1)} className="text-slate-400 font-bold hover:text-slate-600">Alterar Email</button>
            </div>
          </div>
        )}

        {regStep === 3 && (
          <div className="space-y-8 text-center animate-in bounce-in">
            <div className="w-32 h-32 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">TUDO PRONTO! 🎊</h2>
            <p className="text-xl font-bold text-slate-500">Bem-vindo à elite do estudo, {regForm.displayName}.</p>
            <Button3D color="dark" className="w-full" onClick={() => window.location.reload()}>
              ENTRAR NO DASHBOARD 🚀
            </Button3D>
          </div>
        )}
      </Card3D>
    </div>
  );

  // App Principal (Dashboard)
  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-900 pb-24">
      
      {/* NAVBAR SUPERIOR EXPANDIDA */}
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b-2 border-slate-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('dashboard')}>
            {/* INSTRUÇÃO PARA IMAGEM: Aqui podes trocar o ícone pela imagem Captura de ecrã 2026-05-13, às 17.10.06.png */}
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
               <Brain size={28} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl leading-none tracking-tighter uppercase italic">ESTUDO MÁGICO</h1>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase italic">V3.0 PRO</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile.grade} • {profile.country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Stats Visuais */}
            <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={18} />
                <span className="font-black text-sm">{profile.xp} XP</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <Zap className="text-amber-500" size={18} />
                <span className="font-black text-sm">{profile.coins}</span>
              </div>
            </div>

            {/* Acesso Admin (Exclusivo para o email do Simão) */}
            {profile.isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className={`p-3 rounded-2xl transition-all border-2 ${view === 'admin' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200' : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'}`}>
                <ShieldAlert size={24} />
              </button>
            )}

            <button className="relative p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-indigo-600 hover:text-white transition-all">
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 border-4 border-white rounded-full" />
              )}
            </button>

            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black cursor-pointer hover:scale-105 transition-all">
              {profile.displayName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* VIEW: DASHBOARD PRINCIPAL */}
        {view === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            
            {/* Hero Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">OLÁ, {profile.displayName.split(' ')[0]}! ⚡</h2>
                </div>
                <p className="text-xl font-bold text-slate-400 max-w-xl">Pronto para dominar o {profile.grade}? Hoje temos novos desafios na Arena e o teu Tutor IA está atualizado. 📚</p>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                 <Button3D color="indigo" className="flex-1 lg:flex-none py-6 px-10 text-xl" icon={Sword} onClick={() => setView('arena')}>
                    JOGAR ARENA
                 </Button3D>
              </div>
            </header>

            {/* Grid de Atividades */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Card3D onClick={() => setView('study')} className="bg-blue-600 text-white border-none group overflow-hidden">
                  <div className="relative z-10">
                    <Camera size={40} className="mb-6 group-hover:rotate-12 transition-transform" />
                    <h3 className="text-2xl font-black leading-tight uppercase italic">Scan de<br/>Estudo IA</h3>
                    <p className="mt-2 text-blue-100 font-bold text-sm">Resumos automáticos do teu caderno 📸</p>
                  </div>
                  <Sparkles className="absolute -right-6 -bottom-6 text-white/10" size={160} />
               </Card3D>

               <Card3D className="bg-emerald-500 text-white border-none group overflow-hidden">
                  <div className="relative z-10">
                    <BookOpen size={40} className="mb-6 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-black leading-tight uppercase italic">Minha<br/>Biblioteca</h3>
                    <p className="mt-2 text-emerald-50 font-bold text-sm">Todos os teus conteúdos salvos 📖</p>
                  </div>
                  <History className="absolute -right-6 -bottom-6 text-white/10" size={160} />
               </Card3D>

               <Card3D className="bg-slate-900 text-white border-none group overflow-hidden col-span-1 md:col-span-2">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                       <h3 className="text-3xl font-black leading-none uppercase italic tracking-tighter">Missão do Dia 🎯</h3>
                       <Badge color="orange">XP x2</Badge>
                    </div>
                    <div className="space-y-4 mt-8">
                       <div className="flex justify-between items-end text-sm font-black uppercase">
                          <span>Completar 3 Quiz de Matemática</span>
                          <span className="text-amber-400">1 / 3</span>
                       </div>
                       <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: '33%' }} />
                       </div>
                    </div>
                  </div>
                  <Target className="absolute -right-10 -top-10 text-white/5" size={240} />
               </Card3D>
            </div>

            {/* Leaderboard e Chat Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               
               {/* LEADERBOARD REAL */}
               <Card3D className="lg:col-span-2" noHover>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-3xl font-black flex items-center gap-4 italic tracking-tighter uppercase">
                      <Trophy className="text-amber-500" size={32} /> Elite do {profile.country}
                    </h3>
                    <div className="flex gap-2">
                       <div className="p-2 bg-slate-50 rounded-xl border border-slate-100"><Search size={18} /></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboard.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        A recrutar estudantes... 📡
                      </div>
                    ) : (
                      leaderboard.map((u, index) => (
                        <div key={u.id} className={`flex items-center justify-between p-6 rounded-[2rem] transition-all ${u.email === profile.email ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02] z-10 relative' : 'bg-slate-50 hover:bg-slate-100'}`}>
                          <div className="flex items-center gap-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-400 text-white rotate-6' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                               #{index + 1}
                             </div>
                             <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tight">{u.displayName}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${u.email === profile.email ? 'text-indigo-200' : 'text-slate-400'}`}>{u.grade} • {u.country}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right">
                                <p className="font-black text-xl leading-none">{u.xp.toLocaleString()}</p>
                                <p className={`text-[10px] font-black uppercase ${u.email === profile.email ? 'text-indigo-200' : 'text-slate-400'}`}>XP TOTAL</p>
                             </div>
                             <ChevronRight size={20} className={u.email === profile.email ? 'text-white/50' : 'text-slate-300'} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </Card3D>

               {/* TUTOR IA INTEGRADO */}
               <div className="flex flex-col gap-6">
                  <Card3D className="bg-slate-900 text-white border-none flex flex-col h-[600px] overflow-hidden" noHover>
                     <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <MessageCircle size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-xl leading-none uppercase italic tracking-tight">Tutor IA Profissional</h4>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" /> Ligado ao {profile.grade}
                          </span>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                        {chatLog.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-[1.5rem] font-bold text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/10'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[8px] font-black uppercase text-slate-500 mt-1 px-2">{msg.role === 'ai' ? 'Bot Inteligente' : 'Tu'}</span>
                          </div>
                        ))}
                     </div>

                     <div className="flex gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 focus-within:border-indigo-500 transition-all">
                        <input 
                          className="flex-1 bg-transparent p-4 outline-none font-bold text-white text-sm" 
                          placeholder="Pergunta qualquer coisa..." 
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && askAI()}
                        />
                        <button 
                          onClick={askAI}
                          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                          <Send size={24} />
                        </button>
                     </div>
                  </Card3D>

                  {/* Wildcard Card: Sugestão Aleatória */}
                  <Card3D className="bg-orange-50 border-orange-100" onClick={() => alert("Explorando novos mundos...")}>
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500 text-white rounded-2xl"><Globe size={24}/></div>
                        <div>
                           <h4 className="font-black text-orange-900 uppercase italic">Desafio Aleatório</h4>
                           <p className="text-xs font-bold text-orange-700">Aprende algo fora do 7º ano hoje! 🌍</p>
                        </div>
                     </div>
                  </Card3D>
               </div>
            </div>
          </div>
        )}

        {/* VIEW: ADMIN PANEL (SÓ PARA O SIMÃO) */}
        {view === 'admin' && profile.isAdmin && (
          <div className="space-y-10 animate-in slide-in-from-top-10 duration-500">
             <header className="flex justify-between items-center">
                <div className="space-y-2">
                   <h2 className="text-5xl font-black tracking-tighter uppercase italic text-rose-600">PAINEL DE CONTROLO 🛡️</h2>
                   <p className="text-slate-500 font-bold italic underline decoration-rose-200">Acesso exclusivo: {profile.email}</p>
                </div>
                <Button3D color="white" onClick={() => setView('dashboard')}>FECHAR ADMIN</Button3D>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card3D className="bg-white border-2 border-slate-100 text-center py-10" noHover>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Utilizadores Totais</p>
                   <p className="text-6xl font-black text-slate-900">{leaderboard.length}</p>
                </Card3D>
                <Card3D className="bg-white border-2 border-slate-100 text-center py-10" noHover>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Mensagens Ativas</p>
                   <p className="text-6xl font-black text-slate-900">{notifications.length}</p>
                </Card3D>
                <Card3D className="bg-white border-2 border-slate-100 text-center py-10" noHover>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Relatórios</p>
                   <p className="text-6xl font-black text-rose-500">0</p>
                </Card3D>
                <Card3D className="bg-slate-900 text-white border-none text-center py-10" noHover>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Status Sistema</p>
                   <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-2xl font-black uppercase">ONLINE</span>
                   </div>
                </Card3D>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card3D className="p-8" noHover>
                   <h3 className="text-2xl font-black mb-8 border-b-2 border-slate-50 pb-4 uppercase italic">Enviar Notificação Global 📢</h3>
                   <div className="space-y-6">
                      <textarea 
                        className="w-full h-32 p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:border-rose-500 transition-all"
                        placeholder="Escreve aqui o aviso importante para todos os alunos..."
                        id="admin_msg"
                      />
                      <Button3D color="red" className="w-full py-5" icon={Send} onClick={() => {
                        const val = document.getElementById('admin_msg').value;
                        if(val) { sendGlobalAnnouncement(val); document.getElementById('admin_msg').value = ''; }
                      }}>
                        PUBLICAR AVISO
                      </Button3D>
                   </div>
                </Card3D>

                <Card3D className="p-8 overflow-hidden" noHover>
                   <h3 className="text-2xl font-black mb-8 border-b-2 border-slate-50 pb-4 uppercase italic">Gestão de Alunos 👥</h3>
                   <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {leaderboard.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-500">{u.displayName[0]}</div>
                              <div>
                                 <p className="font-black text-sm">{u.displayName}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button className="p-2 bg-white text-slate-400 rounded-lg hover:text-indigo-600 border border-slate-100"><Eye size={18}/></button>
                              <button className="p-2 bg-white text-slate-400 rounded-lg hover:text-rose-600 border border-slate-100"><Trash2 size={18}/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card3D>
             </div>
          </div>
        )}
      </main>

      {/* FOOTER MOBILE FIXO (UI ESTILO APP) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-2 border-slate-100 p-4 flex justify-around items-center lg:hidden z-[200]">
        <button onClick={() => setView('dashboard')} className={`p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutDashboard size={24}/></button>
        <button onClick={() => setView('study')} className={`p-4 rounded-2xl transition-all ${view === 'study' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Camera size={24}/></button>
        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] -mt-12 flex items-center justify-center text-white shadow-2xl border-[6px] border-[#F1F5F9]" onClick={() => setView('arena')}>
           <Sword size={28} />
        </div>
        <button className="p-4 text-slate-400"><BookOpen size={24}/></button>
        <button onClick={() => setView('admin')} className={`p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}><Settings size={24}/></button>
      </nav>

      {/* ESTILOS GLOBAIS CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif; 
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    orange: "bg-orange-100 text-orange-700",
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700"
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {children}
    </span>
  );
};

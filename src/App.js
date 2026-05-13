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
  Share2, Copy, Check, Send, Award, Star, SearchCode, Ghost, Rocket
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, 
  onSnapshot, addDoc, serverTimestamp, updateDoc, query, orderBy, limit 
} from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE DO SIMÃO ---
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

// --- COMPONENTES DE INTERFACE (UI) ---

const Button3D = ({ children, color = "blue", onClick, disabled, className = "" }) => {
  const colors = {
    blue: "bg-blue-600 shadow-[0_5px_0_0_#1d4ed8] active:shadow-[0_0px_0_0_#1d4ed8]",
    green: "bg-emerald-600 shadow-[0_5px_0_0_#047857] active:shadow-[0_0px_0_0_#047857]",
    purple: "bg-indigo-600 shadow-[0_5px_0_0_#4338ca] active:shadow-[0_0px_0_0_#4338ca]",
    red: "bg-rose-600 shadow-[0_5px_0_0_#be123c] active:shadow-[0_0px_0_0_#be123c]",
    orange: "bg-orange-500 shadow-[0_5px_0_0_#c2410c] active:shadow-[0_0px_0_0_#c2410c]",
    white: "bg-white text-slate-800 border-2 border-slate-200 shadow-[0_5px_0_0_#e2e8f0] active:shadow-[0_0px_0_0_#e2e8f0]",
    indigo: "bg-indigo-700 shadow-[0_5px_0_0_#3730a3] active:shadow-[0_0px_0_0_#3730a3]",
    dark: "bg-slate-900 shadow-[0_5px_0_0_#000000] active:shadow-[0_0px_0_0_#000000]"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`relative inline-flex items-center justify-center font-black py-3 px-6 rounded-2xl transition-all duration-150 active:translate-y-[5px] ${colors[color]} ${color === 'white' ? '' : 'text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'} ${className}`}>
      {children}
    </button>
  );
};

const Card3D = ({ children, className = "", onClick, noHover = false }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-[2rem] p-6 border-2 border-slate-100 shadow-sm transition-all ${!noHover && onClick ? 'cursor-pointer hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50 active:scale-[0.97]' : ''} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    purple: "bg-indigo-100 text-indigo-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-rose-100 text-rose-700"
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[color]}`}>{children}</span>;
};

// --- APLICAÇÃO PRINCIPAL ---

export default function EstudoMagico() {
  // Estados de Utilizador e Navegação
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ xp: 0, level: 1, name: 'Estudante', grade: '7.º Ano', coins: 0 });
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', grade: '7.º Ano' });

  // Estados do Estudo e IA
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  
  // Estados da Arena
  const [quizState, setQuizState] = useState({ active: false, subject: '', questionIndex: 0, score: 0 });
  const [arenaSub, setArenaSub] = useState(null);

  // Estados de Mensagens/Emails
  const [emails, setEmails] = useState([
    { id: 1, from: 'Sistema', subject: 'Bem-vindo ao Estudo Mágico!', body: 'Parabéns por começares a tua jornada de estudo no 7.º ano!', date: 'Agora', read: false },
    { id: 2, from: 'Prof. IA', subject: 'Dica de Matemática', body: 'Viste o novo resumo sobre Equações?', date: '1h atrás', read: true }
  ]);
  const [showEmails, setShowEmails] = useState(false);

  const fileInputRef = useRef(null);

  // Efeito de Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setIsNewUser(true);
        }
      } else {
        signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  // Lógica de Experiência (XP)
  const addXP = async (amount) => {
    if (!user) return;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const updateData = { xp: newXP, level: newLevel, coins: (profile.coins || 0) + (amount / 2) };
    await updateDoc(doc(db, 'users', user.uid), updateData);
    setProfile(prev => ({ ...prev, ...updateData }));
  };

  // Funções de Estudo
  const processImage = async () => {
    setLoading(true);
    // Simulando processamento de visão da IA
    setTimeout(() => {
      setResult({
        title: "Resumo Estruturado: O 7.º Ano",
        content: "A matéria enviada foca-se na organização celular e nos reinos da vida. Lembra-te que as células eucarióticas têm núcleo definido!",
        concepts: ["Célula", "Núcleo", "Mitocôndria", "Reino Animalia"],
        quiz: [
          { q: "O que distingue a célula eucariótica?", a: "A presença de núcleo." },
          { q: "Qual a função da mitocôndria?", a: "Produção de energia." }
        ]
      });
      addXP(150);
      setLoading(false);
    }, 2500);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user', text: chatInput };
    setChatHistory([...chatHistory, newMsg]);
    setChatInput("");
    
    // Resposta automática da IA
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Interessante! Queres que eu aprofunde esse tópico ou que crie um exercício rápido?" }]);
    }, 1000);
  };

  // Lógica de Registo Inicial
  const handleRegister = async () => {
    if (!regForm.name.trim() || !user) return;
    setLoading(true);
    const data = { 
      ...regForm, 
      xp: 0, 
      level: 1, 
      coins: 50,
      createdAt: serverTimestamp() 
    };
    await setDoc(doc(db, 'users', user.uid), data);
    setProfile(data);
    setIsNewUser(false);
    setLoading(false);
  };

  // --- RENDERS DE ECRA ---

  if (isNewUser) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <Card3D className="max-w-md w-full space-y-8 py-10" noHover>
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200">
            <GraduationCap className="text-white" size={48} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter">BEM-VINDO! 🎓</h2>
          <p className="text-slate-500 font-bold">Vamos configurar o teu Estudo Mágico.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400">Teu Nome de Herói</label>
            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" 
              placeholder="Ex: Simão" 
              onChange={e => setRegForm({...regForm, name: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400">Email de Contacto</label>
            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" 
              placeholder="simao@email.com" 
              onChange={e => setRegForm({...regForm, email: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400">Teu Ano Escolar</label>
            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none appearance-none" 
              onChange={e => setRegForm({...regForm, grade: e.target.value})}>
              <option>7.º Ano</option>
              <option>8.º Ano</option>
              <option>9.º Ano</option>
            </select>
          </div>
        </div>

        <Button3D color="indigo" className="w-full py-5 text-xl" onClick={handleRegister}>
          COMEÇAR AVENTURA 🚀
        </Button3D>
      </Card3D>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      
      {/* NAVBAR SUPERIOR */}
      <nav className="bg-white/80 backdrop-blur-md border-b-2 border-slate-100 p-4 sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
              <Brain size={32} />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-2xl block leading-none tracking-tighter italic">ESTUDO MÁGICO</span>
              <div className="flex gap-2 mt-1">
                <Badge color="purple">PRO</Badge>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile.grade}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* SISTEMA DE EMAILS/MENSAGENS */}
             <div className="relative">
                <button 
                  onClick={() => setShowEmails(!showEmails)}
                  className={`p-4 rounded-2xl transition-all border-2 ${showEmails ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400 hover:text-indigo-600'}`}>
                  <Mail size={24} />
                  {emails.some(e => !e.read) && (
                    <span className="absolute top-3 right-3 w-4 h-4 bg-rose-500 rounded-full border-4 border-white animate-bounce" />
                  )}
                </button>

                {showEmails && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl border-2 border-slate-100 shadow-2xl p-4 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h4 className="font-black text-lg">Mensagens</h4>
                      <button onClick={() => setShowEmails(false)}><X size={20}/></button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {emails.map(email => (
                        <div key={email.id} className={`p-4 rounded-2xl cursor-pointer transition-all ${email.read ? 'bg-slate-50' : 'bg-indigo-50 border-2 border-indigo-100'}`}>
                          <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">{email.from}</p>
                          <p className="font-bold text-sm leading-tight">{email.subject}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-bold">{email.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <div className="hidden md:flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                  {profile.level}
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-black text-slate-400 mb-1">
                    <span>XP</span>
                    <span>{profile.xp % 1000}/1000</span>
                  </div>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${(profile.xp % 1000) / 10}%` }} />
                  </div>
                </div>
             </div>

             <button className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all">
                <User size={24}/>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        
        {/* DASHBOARD PRINCIPAL */}
        {view === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">BOAS, {profile.name.split(' ')[0]}! ⚡</h1>
                <p className="text-xl font-bold text-slate-400">O que vamos conquistar hoje no {profile.grade}?</p>
              </div>
              <div className="flex gap-4">
                <Card3D className="bg-orange-500 text-white border-none py-4 px-8 flex items-center gap-4" noHover>
                  <div className="p-3 bg-white/20 rounded-2xl"><Flame /></div>
                  <div>
                    <p className="text-[10px] font-black opacity-70 uppercase">XP Total</p>
                    <p className="text-3xl font-black tracking-tight">{profile.xp}</p>
                  </div>
                </Card3D>
                <Card3D className="bg-emerald-500 text-white border-none py-4 px-8 flex items-center gap-4" noHover>
                  <div className="p-3 bg-white/20 rounded-2xl"><Zap /></div>
                  <div>
                    <p className="text-[10px] font-black opacity-70 uppercase">Moedas</p>
                    <p className="text-3xl font-black tracking-tight">{profile.coins}</p>
                  </div>
                </Card3D>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card3D onClick={() => setView('daily_mode')} className="hover:bg-blue-600 hover:text-white border-blue-100 group overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all">
                    <Camera size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-2">SCAN DE ESTUDO</h3>
                  <p className="font-bold opacity-70">Tira foto ao caderno e a IA resume tudo por ti.</p>
                </div>
                <Sparkles className="absolute -right-4 -bottom-4 text-blue-100 group-hover:text-white/10" size={140} />
              </Card3D>

              <Card3D onClick={() => setView('arena')} className="hover:bg-indigo-600 hover:text-white border-indigo-100 group overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all">
                    <Sword size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-2">ARENA QUIZ</h3>
                  <p className="font-bold opacity-70">Enfrenta desafios épicos e sobe no ranking.</p>
                </div>
                <Trophy className="absolute -right-4 -bottom-4 text-indigo-100 group-hover:text-white/10" size={140} />
              </Card3D>

              <Card3D onClick={() => setView('subjects')} className="hover:bg-emerald-600 hover:text-white border-emerald-100 group overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all">
                    <BookIcon size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-2">BIBLIOTECA</h3>
                  <p className="font-bold opacity-70">Todos os teus resumos organizados por disciplina.</p>
                </div>
                <Library className="absolute -right-4 -bottom-4 text-emerald-100 group-hover:text-white/10" size={140} />
              </Card3D>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <Card3D className="lg:col-span-2" noHover>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                      <Trophy className="text-amber-500" /> TOP ESTUDANTES PORTUGAL
                    </h3>
                    <Badge color="orange">AO VIVO 🔴</Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Diogo Silva', xp: '15.4k', rank: 1, color: 'bg-amber-100 text-amber-600' },
                      { name: 'Simão', xp: profile.xp, rank: 2, color: 'bg-slate-100 text-slate-600', isUser: true },
                      { name: 'Matilde M.', xp: '12.1k', rank: 3, color: 'bg-orange-100 text-orange-600' }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-5 rounded-3xl transition-all ${item.isUser ? 'bg-indigo-600 text-white scale-105 shadow-xl' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-5">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.color && !item.isUser ? item.color : 'bg-white/20 text-white'}`}>
                            #{item.rank}
                          </span>
                          <div className={`w-12 h-12 rounded-full border-4 ${item.isUser ? 'border-white/30' : 'border-white'} bg-slate-200`} />
                          <span className="font-black text-lg">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="font-black">{item.xp} XP</span>
                           <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
               </Card3D>

               <Card3D className="bg-slate-900 text-white border-none overflow-hidden group" noHover>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-black leading-tight">PRECISAS DE AJUDA COM TPC? 🆘</h3>
                    <p className="font-bold text-slate-400">A nossa IA está pronta para explicar qualquer exercício de forma simples.</p>
                    <div className="flex flex-col gap-3">
                      <Button3D color="indigo" className="w-full">ABRIR CHAT</Button3D>
                      <Button3D color="dark" className="w-full border border-slate-700">VER TUTORIAL</Button3D>
                    </div>
                  </div>
                  <Ghost className="absolute -right-10 -top-10 text-white/5 group-hover:rotate-12 transition-transform" size={240} />
               </Card3D>
            </div>
          </div>
        )}

        {/* MODO DE ESTUDO DIÁRIO (SCAN) */}
        {view === 'daily_mode' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <header className="flex justify-between items-center">
              <Button3D color="white" onClick={() => setView('dashboard')}>← VOLTAR</Button3D>
              <div className="text-center">
                <Badge color="blue">RESUMIDOR INTELIGENTE</Badge>
                <h2 className="text-3xl font-black mt-2 tracking-tighter">TRANSFORMA O TEU CADERNO</h2>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </header>

            {!result ? (
              <Card3D className="py-20 text-center space-y-10" noHover>
                {!capturedImage ? (
                  <>
                    <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[3rem] flex items-center justify-center mx-auto animate-pulse">
                      <Camera size={64} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black tracking-tight">O que vamos aprender?</h3>
                      <p className="text-slate-400 font-bold max-w-sm mx-auto">Carrega uma foto nítida dos teus apontamentos para começarmos a magia.</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => setCapturedImage(URL.createObjectURL(e.target.files[0]))} />
                    <Button3D color="indigo" className="px-12 py-6 text-xl shadow-indigo-200" onClick={() => fileInputRef.current.click()}>
                      <Upload className="mr-3" /> CARREGAR APONTAMENTOS
                    </Button3D>
                  </>
                ) : (
                  <div className="space-y-8">
                    <div className="relative inline-block group">
                      <img src={capturedImage} className="max-h-[500px] rounded-[2.5rem] shadow-2xl border-8 border-white" alt="Preview" />
                      <button onClick={() => setCapturedImage(null)} className="absolute -top-4 -right-4 bg-rose-500 text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-all">
                        <Trash2 size={24}/>
                      </button>
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button3D color="white" onClick={() => setCapturedImage(null)} className="px-10">CANCELAR</Button3D>
                      <Button3D color="green" onClick={processImage} className="px-12">
                        GERAR RESUMO MÁGICO ✨
                      </Button3D>
                    </div>
                  </div>
                )}
              </Card3D>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card3D className="p-10 relative overflow-hidden" noHover>
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-4xl font-black tracking-tighter text-indigo-600">{result.title}</h2>
                        <Button3D color="white" className="p-3"><Share2 size={20}/></Button3D>
                      </div>
                      <p className="text-xl font-bold text-slate-700 leading-relaxed italic">"{result.content}"</p>
                      
                      <div className="pt-6 border-t-2 border-slate-50 space-y-4">
                        <h4 className="font-black uppercase text-slate-400 tracking-widest text-xs">Conceitos Extraídos</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.concepts.map((c, i) => (
                            <div key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-sm">#{c}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card3D>

                  <Card3D className="bg-slate-900 text-white" noHover>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <MessageCircle size={24}/>
                      </div>
                      <h3 className="text-xl font-black">CHAT COM O PROFESSOR IA</h3>
                    </div>
                    
                    <div className="h-64 overflow-y-auto mb-6 space-y-4 px-2">
                      {chatHistory.length === 0 && (
                        <div className="text-center text-slate-500 py-10 font-bold">Pergunta algo sobre este resumo!</div>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-white/10 border border-white/10'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:bg-white/10 font-bold transition-all" 
                        placeholder="Escreve a tua dúvida..." 
                      />
                      <Button3D color="indigo" onClick={sendMessage}><Send /></Button3D>
                    </div>
                  </Card3D>
                </div>

                <div className="space-y-6">
                  <Card3D className="bg-emerald-50 border-emerald-100" noHover>
                    <h4 className="font-black text-emerald-700 mb-6 flex items-center gap-2"><CheckCircle /> MINI QUIZ</h4>
                    <div className="space-y-4">
                      {result.quiz.map((q, i) => (
                        <div key={i} className="p-4 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm space-y-2">
                          <p className="font-black text-sm text-slate-700">{q.q}</p>
                          <div className="p-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase text-center cursor-pointer hover:bg-emerald-700">Ver Resposta</div>
                        </div>
                      ))}
                    </div>
                  </Card3D>
                  <Button3D color="dark" className="w-full py-5" onClick={() => setResult(null)}>FINALIZAR ESTUDO (+150 XP)</Button3D>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ARENA DE BATALHA */}
        {view === 'arena' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
             <header className="flex justify-between items-center">
              <Button3D color="white" onClick={() => setView('dashboard')}>← SAIR DA ARENA</Button3D>
              <div className="bg-white px-6 py-2 rounded-full border-2 border-slate-100 flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                <span className="font-black text-xs uppercase tracking-tighter">482 Alunos Online</span>
              </div>
            </header>

            <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="relative z-10 space-y-6">
                <Badge color="white" className="!bg-white/20 !text-white">Dificuldade: Normal</Badge>
                <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none">ARENA DE<br/>BATALHA</h2>
                <p className="text-xl font-bold text-indigo-100 max-w-md">Ganhas o dobro do XP em vitórias consecutivas. Estás pronto para o desafio?</p>
                <div className="flex gap-4 pt-4">
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-black opacity-60">VITÓRIAS</p>
                      <p className="text-4xl font-black tracking-tight">12</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-black opacity-60">PRECISÃO</p>
                      <p className="text-4xl font-black tracking-tight">94%</p>
                   </div>
                </div>
              </div>
              <Sword className="absolute -right-20 -bottom-20 text-white/5 rotate-12" size={400} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Matemática', color: 'blue', icon: <Plus />, q: '12 Qs' },
                { name: 'Português', color: 'orange', icon: <Languages />, q: '10 Qs' },
                { name: 'C. Naturais', color: 'green', icon: <Zap />, q: '15 Qs' },
                { name: 'História', color: 'purple', icon: <Globe />, q: '8 Qs' }
              ].map((sub, i) => (
                <Card3D key={i} className="group hover:scale-105" onClick={() => setArenaSub(sub.name)}>
                  <div className={`w-16 h-16 bg-${sub.color}-100 text-${sub.color}-600 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:rotate-12`}>
                    {sub.icon}
                  </div>
                  <h4 className="text-xl font-black mb-1">{sub.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.q}</p>
                </Card3D>
              ))}
            </div>

            {arenaSub && (
              <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                 <Card3D className="max-w-lg w-full p-10 text-center space-y-8" noHover>
                    <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl">
                      <Rocket size={48} className="animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black tracking-tighter uppercase italic">A carregar {arenaSub}...</h3>
                      <p className="font-bold text-slate-500">Prepara-te, a primeira pergunta aparece em 3 segundos!</p>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 animate-[loading_3s_ease-in-out]" />
                    </div>
                    <Button3D color="red" onClick={() => setArenaSub(null)} className="w-full">DESISTIR</Button3D>
                 </Card3D>
              </div>
            )}
          </div>
        )}

      </main>

      {/* OVERLAY DE CARREGAMENTO MAGICO */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 z-[1000] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-slate-100 rounded-full" />
            <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
          </div>
          <h2 className="mt-8 text-3xl font-black text-indigo-600 tracking-tighter uppercase italic animate-pulse">A Conjurar Conhecimento...</h2>
        </div>
      )}

      {/* FOOTER MOBILE / BARRA DE NAVEGAÇÃO RÁPIDA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 p-4 flex justify-around items-center md:hidden z-[100]">
        <button onClick={() => setView('dashboard')} className={`p-3 rounded-xl ${view === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}><LayoutDashboard/></button>
        <button onClick={() => setView('daily_mode')} className={`p-3 rounded-xl ${view === 'daily_mode' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}><Camera/></button>
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl -mt-12 border-8 border-[#F8FAFC] flex items-center justify-center text-white shadow-xl shadow-indigo-200" onClick={() => setView('arena')}>
          <Sword size={28}/>
        </div>
        <button onClick={() => setView('subjects')} className={`p-3 rounded-xl ${view === 'subjects' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}><BookIcon/></button>
        <button className="p-3 rounded-xl text-slate-400"><Settings/></button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        body { font-family: 'Inter', sans-serif; letter-spacing: -0.02em; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
}

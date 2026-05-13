import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, setDoc, updateDoc, increment 
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut 
} from 'firebase/auth';

// ----------------------------------------------------------------------
// CONFIGURAÇÃO FIREBASE
// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC2HOMgI15hXf-0YhceNWmj9dppl1sXi8s",
  authDomain: "estudo-magico-pro.firebaseapp.com",
  projectId: "estudo-magico-pro",
  storageBucket: "estudo-magico-pro.appspot.com",
  messagingSenderId: "17316174654",
  appId: "1:17316174654:web:a98e122832c2f0b44cea6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ----------------------------------------------------------------------
// ÍCONES SVG VETORIAIS (Cores sólidas, design limpo)
// ----------------------------------------------------------------------
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Backpack: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1v-2a3 3 0 0 0-6 0v2H8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z"></path><path d="M10 6v2"></path><path d="M14 6v2"></path><path d="M12 3v3"></path><rect x="6" y="10" width="12" height="11" rx="2" ry="2"></rect></svg>,
  Brain: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.9.5H7a2.5 2.5 0 0 1 0-5h.5a2.5 2.5 0 0 1 0-5H7a2.5 2.5 0 0 1 0-5h.5A2.5 2.5 0 0 1 9.5 2z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.9.5h.1a2.5 2.5 0 0 0 0-5h-.5a2.5 2.5 0 0 0 0-5h.5a2.5 2.5 0 0 0 0-5h-.1A2.5 2.5 0 0 0 14.5 2z"></path></svg>,
  Logout: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Heart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Star: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
export default function EstudoMagicoPro() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados Globais da App
  const [isProcessingMagia, setIsProcessingMagia] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUser({ uid: authUser.uid, ...snap.data() });
          } else {
            // Inicialização Autónoma do Perfil
            const newUserData = { 
              name: "Simão", 
              grade: "7.º ano", 
              xp: 0, 
              level: 1, 
              lives: 5,
              status: 'active' 
            };
            setDoc(userRef, newUserData);
            setUser({ uid: authUser.uid, ...newUserData });
          }
          setLoadingAuth(false);
        });
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });
    return () => unsub();
  }, []);

  if (loadingAuth) {
    return <div className="full-loader"><div className="spinner"></div><p>A iniciar Estudo Mágico Pro...</p></div>;
  }

  return (
    <div className="mobile-app-container fade-in">
      {!user ? (
        <LoginScreen />
      ) : (
        <div className="app-layout">
          <Header user={user} />
          
          <main className="content-area slide-in">
            {activeTab === 'dashboard' && <Dashboard user={user} setTab={setActiveTab} />}
            {activeTab === 'diario' && <ModoDiario user={user} isProcessing={isProcessingMagia} setProcessing={setIsProcessingMagia} />}
            {activeTab === 'mochila' && <MochilaDigital />}
            {activeTab === 'arena' && <ArenaQuiz user={user} />}
          </main>

          <CenteredMenu activeTab={activeTab} setTab={setActiveTab} />
        </div>
      )}
      <Styles />
    </div>
  );
}

// ----------------------------------------------------------------------
// ECRÃ DE AUTENTICAÇÃO
// ----------------------------------------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError("Erro nas credenciais. Tenta novamente!");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card 3d-box">
        <div className="logo-container">
          <Icons.Brain />
        </div>
        <h1>Estudo Mágico Pro</h1>
        <p className="subtitle">O teu portal de estudo gamificado</p>
        
        <form onSubmit={handleAuth} className="auth-form">
          <input 
            type="email" 
            placeholder="Email Escolar ou Pessoal" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-3d"
          />
          <input 
            type="password" 
            placeholder="Palavra-passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-3d"
          />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary 3d-button auth-btn">
            {isRegistering ? 'Criar Conta Mágica' : 'Entrar no Portal'}
          </button>
        </form>
        
        <button className="text-btn" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Já tens conta? Entra aqui' : 'Novo aluno? Regista-te'}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// CABEÇALHO (Header)
// ----------------------------------------------------------------------
function Header({ user }) {
  return (
    <header className="app-header">
      <div className="user-profile">
        <div className="avatar">{user.name.charAt(0)}</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-grade">{user.grade}</span>
        </div>
      </div>
      <div className="user-stats">
        <div className="stat-pill heart-pill">
          <Icons.Heart /> <span>{user.lives}</span>
        </div>
        <div className="stat-pill star-pill">
          <Icons.Star /> <span>{user.xp} XP</span>
        </div>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          <Icons.Logout />
        </button>
      </div>
    </header>
  );
}

// ----------------------------------------------------------------------
// MENU CENTRADO (Mobile Bottom Navigation)
// ----------------------------------------------------------------------
function CenteredMenu({ activeTab, setTab }) {
  const tabs = [
    { id: 'dashboard', icon: <Icons.Home />, label: 'Início', color: 'blue' },
    { id: 'diario', icon: <Icons.Book />, label: 'Diário', color: 'green' },
    { id: 'mochila', icon: <Icons.Backpack />, label: 'Mochila', color: 'orange' },
    { id: 'arena', icon: <Icons.Brain />, label: 'Arena', color: 'red' }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? `active-${tab.color}` : ''}`}
            onClick={() => setTab(tab.id)}
          >
            <div className="icon-wrapper">{tab.icon}</div>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ----------------------------------------------------------------------
// DASHBOARD PRINCIPAL
// ----------------------------------------------------------------------
function Dashboard({ user, setTab }) {
  return (
    <div className="dashboard-view">
      <div className="welcome-banner 3d-box blue-bg">
        <h2>Bem-vindo de volta, {user.name}! 🚀</h2>
        <p>Estás no Nível {user.level}. Faltam 150 XP para o próximo nível.</p>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: '65%' }}></div>
        </div>
      </div>

      <h3 className="section-title">Acesso Rápido</h3>
      <div className="quick-actions-grid">
        <div className="action-card 3d-box click-effect" onClick={() => setTab('diario')}>
          <div className="card-icon green-icon"><Icons.Book /></div>
          <h4>Resumir Matéria</h4>
          <p>Cola apontamentos e gera resumos.</p>
        </div>
        <div className="action-card 3d-box click-effect" onClick={() => setTab('arena')}>
          <div className="card-icon red-icon"><Icons.Brain /></div>
          <h4>Treinar Quiz</h4>
          <p>Ganha XP respondendo a perguntas.</p>
        </div>
        <div className="action-card 3d-box click-effect full-width" onClick={() => setTab('mochila')}>
          <div className="card-icon orange-icon"><Icons.Backpack /></div>
          <h4>Pesquisar Manuais PDF</h4>
          <p>Encontra resoluções e manuais através do Google Grounding.</p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODO DIÁRIO (Resumos IA)
// ----------------------------------------------------------------------
function ModoDiario({ user, isProcessing, setProcessing }) {
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState(null);

  const generateSummary = () => {
    if (!subject || !notes) return alert("Preenche a disciplina e os apontamentos!");
    setProcessing(true);
    
    // Simulação da chamada à Gemini 2.5 Flash
    setTimeout(() => {
      setSummary({
        title: `Resumo de ${subject} 📚`,
        content: `Aqui estão os pontos principais da tua matéria 🎯\n\nConceito Central 🧠 A matéria foca-se nos princípios básicos introduzidos na aula.\n\nDetalhes Importantes 🔍 Foi referido que os processos são contínuos e afetam o ambiente em redor.\n\nDica de Estudo 💡 Revê as datas e os nomes dos processos biológicos mencionados no final da página.`,
        quizLink: true
      });
      setProcessing(false);
    }, 2500);
  };

  return (
    <div className="module-view">
      <h2 className="module-header">📖 Modo Diário</h2>
      {!summary ? (
        <div className="input-section 3d-box">
          <label>Disciplina</label>
          <input 
            type="text" 
            placeholder="Ex: Ciências Naturais" 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            className="input-3d"
          />
          <label>Os teus apontamentos</label>
          <textarea 
            placeholder="Cola aqui a matéria dada na aula..." 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            className="input-3d textarea-3d"
            rows="6"
          ></textarea>
          
          <button 
            className="btn-primary 3d-button w-full" 
            onClick={generateSummary}
            disabled={isProcessing}
          >
            {isProcessing ? 'A Processar Magia (IA)... ⏳' : 'Gerar Resumo Mágico ✨'}
          </button>
        </div>
      ) : (
        <div className="result-section fade-in">
          <div className="summary-card 3d-box">
            <h3>{summary.title}</h3>
            {summary.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="summary-paragraph">{paragraph}</p>
            ))}
          </div>
          <button className="btn-secondary 3d-button w-full mt-4" onClick={() => setSummary(null)}>
            🔄 Novo Resumo
          </button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// MOCHILA DIGITAL (Search Grounding de Manuais)
// ----------------------------------------------------------------------
function MochilaDigital() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const books = [
    { id: 1, title: 'Matemática - Novo Espaço', publisher: 'Porto Editora' },
    { id: 2, title: 'Ciências Naturais - Viva a Terra', publisher: 'Leya' },
    { id: 3, title: 'História - O Fio do Tempo', publisher: 'Texto Editores' }
  ];

  const handleSearch = (book) => {
    setSelectedBook(book);
    setIsSearching(true);
    // Simulação do Google Search Grounding da Gemini
    setTimeout(() => {
      setSearchResults([
        { title: `Resoluções Oficiais ${book.title} (PDF)`, url: 'https://portoeditora.pt/recursos', source: 'Oficial' },
        { title: `Apontamentos da Comunidade - ${book.title}`, url: 'https://studocu.com/pt', source: 'Studocu' }
      ]);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="module-view">
      <h2 className="module-header">🎒 Mochila Digital</h2>
      <p className="helper-text">Clica num manual para pesquisar recursos reais em PDF.</p>
      
      <div className="books-list">
        {books.map(book => (
          <div key={book.id} className="book-item 3d-box click-effect" onClick={() => handleSearch(book)}>
            <div className="book-icon">📘</div>
            <div className="book-details">
              <h4>{book.title}</h4>
              <span>{book.publisher}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className="search-modal fade-in">
          <div className="modal-content 3d-box">
            <button className="close-btn" onClick={() => setSelectedBook(null)}>X</button>
            <h3>Resultados para: {selectedBook.title}</h3>
            {isSearching ? (
              <div className="loading-text">A utilizar Search Grounding 🌍...</div>
            ) : (
              <div className="results-list">
                {searchResults.map((res, idx) => (
                  <a key={idx} href="#" className="result-card" onClick={e => e.preventDefault()}>
                    <span className="res-badge">{res.source}</span>
                    <p>{res.title}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// ARENA QUIZ (Sistema Gamificado)
// ----------------------------------------------------------------------
function ArenaQuiz({ user }) {
  const [state, setState] = useState('start'); // start, playing, result
  const [score, setScore] = useState(0);

  const startQuiz = () => {
    if (user.lives <= 0) return alert("Ficaste sem vidas! Volta mais tarde ou revê a matéria.");
    setState('playing');
    setScore(0);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 50);
      updateDoc(doc(db, 'users', user.uid), { xp: increment(50) });
      setState('result');
    } else {
      updateDoc(doc(db, 'users', user.uid), { lives: increment(-1) });
      alert("Resposta errada! Perdeste 1 vida 💔");
      setState('start');
    }
  };

  return (
    <div className="module-view arena-container">
      {state === 'start' && (
        <div className="arena-menu 3d-box text-center">
          <h2>⚔️ Arena de Treino</h2>
          <p>Testa os teus conhecimentos e ganha XP para subires no ranking global.</p>
          <div className="arena-stats">
            <div>Vidas Atuais: <strong>{user.lives} ❤️</strong></div>
            <div>O teu XP: <strong>{user.xp} 🌟</strong></div>
          </div>
          <button className="btn-primary 3d-button arena-btn" onClick={startQuiz}>
            Iniciar Combate
          </button>
        </div>
      )}

      {state === 'playing' && (
        <div className="quiz-active 3d-box fade-in">
          <span className="quiz-badge">Ciências Naturais</span>
          <h3 className="question-text">Qual destes processos faz com que a água dos rios se transforme em vapor?</h3>
          <div className="options-grid">
            <button className="option-btn 3d-button" onClick={() => handleAnswer(false)}>Condensação</button>
            <button className="option-btn 3d-button" onClick={() => handleAnswer(false)}>Precipitação</button>
            <button className="option-btn 3d-button correct-path" onClick={() => handleAnswer(true)}>Evaporação</button>
            <button className="option-btn 3d-button" onClick={() => handleAnswer(false)}>Infiltração</button>
          </div>
        </div>
      )}

      {state === 'result' && (
        <div className="result-view 3d-box text-center fade-in">
          <div className="victory-icon">🏆</div>
          <h3>Resposta Certa!</h3>
          <p>Ganhaste <strong>+50 XP</strong></p>
          <button className="btn-primary 3d-button" onClick={() => setState('start')}>
            Continuar a Treinar
          </button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// CSS GLOBAL ESTILO NEUMORFISMO 3D DARK (Com cores sólidas e planas)
// ----------------------------------------------------------------------
function Styles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      :root {
        --bg-main: #121212;
        --surface: #1e1e1e;
        --surface-hover: #2a2a2a;
        --text-main: #f3f4f6;
        --text-muted: #9ca3af;
        
        --color-blue: #3b82f6;
        --color-blue-dark: #2563eb;
        --color-green: #10b981;
        --color-green-dark: #059669;
        --color-orange: #f59e0b;
        --color-orange-dark: #d97706;
        --color-red: #ef4444;
        --color-red-dark: #dc2626;

        --shadow-dark: 5px 5px 10px #0a0a0a, -5px -5px 10px #1a1a1a;
        --shadow-inset: inset 4px 4px 8px #0a0a0a, inset -4px -4px 8px #1a1a1a;
      }

      * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

      body, html {
        margin: 0; padding: 0;
        background-color: var(--bg-main);
        color: var(--text-main);
        height: 100%;
        overflow-x: hidden;
      }

      /* Layout Mobile-First */
      .mobile-app-container {
        max-width: 480px;
        margin: 0 auto;
        min-height: 100vh;
        background-color: var(--bg-main);
        position: relative;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
      }

      .app-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .content-area {
        flex: 1;
        overflow-y: auto;
        padding: 20px 20px 100px 20px;
      }

      /* Utilidades 3D e Neumorfismo */
      .3d-box {
        background: var(--surface);
        border-radius: 16px;
        box-shadow: var(--shadow-dark);
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid rgba(255,255,255,0.05);
      }

      .input-3d {
        width: 100%;
        padding: 15px;
        border-radius: 12px;
        background: var(--bg-main);
        border: none;
        color: var(--text-main);
        box-shadow: var(--shadow-inset);
        margin-bottom: 15px;
        font-size: 16px;
        outline: none;
      }
      .input-3d:focus { border: 1px solid var(--color-blue); }

      .textarea-3d { resize: vertical; min-height: 120px; }

      .3d-button {
        border: none;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 16px;
        color: #fff;
        cursor: pointer;
        transition: transform 0.1s, box-shadow 0.1s;
        box-shadow: 0 4px 0 rgba(0,0,0,0.4);
      }
      .3d-button:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 rgba(0,0,0,0.4);
      }

      .btn-primary { background-color: var(--color-blue); }
      .btn-secondary { background-color: var(--surface-hover); color: var(--text-main); }
      .w-full { width: 100%; }
      .mt-4 { margin-top: 16px; }

      /* Animações */
      .fade-in { animation: fadeIn 0.4s ease forwards; }
      .slide-in { animation: slideIn 0.3s ease forwards; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      /* Loader */
      .full-loader { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-blue); }
      .spinner { width: 40px; height: 40px; border: 4px solid var(--surface); border-top: 4px solid var(--color-blue); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;}
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

      /* Auth Screen */
      .auth-screen { display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px; }
      .auth-card { width: 100%; text-align: center; }
      .logo-container { background: var(--bg-main); width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-inset); color: var(--color-blue); }
      .subtitle { color: var(--text-muted); margin-bottom: 30px; font-size: 14px; }
      .text-btn { background: none; border: none; color: var(--color-blue); margin-top: 20px; font-weight: 600; cursor: pointer; }

      /* Header */
      .app-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--surface); border-bottom: 1px solid rgba(255,255,255,0.05); }
      .user-profile { display: flex; align-items: center; gap: 12px; }
      .avatar { width: 45px; height: 45px; border-radius: 50%; background: var(--color-blue); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; color: white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); }
      .user-info { display: flex; flex-direction: column; }
      .user-name { font-weight: 700; font-size: 16px; }
      .user-grade { font-size: 12px; color: var(--text-muted); }
      .user-stats { display: flex; gap: 8px; align-items: center; }
      .stat-pill { display: flex; align-items: center; gap: 5px; background: var(--bg-main); padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; box-shadow: var(--shadow-inset); }
      .logout-btn { background: var(--bg-main); border: none; color: var(--color-red); padding: 8px; border-radius: 50%; cursor: pointer; box-shadow: var(--shadow-dark); display: flex; align-items: center; }

      /* Bottom Navigation (Centrado e Completo) */
      .bottom-nav { position: absolute; bottom: 0; left: 0; right: 0; background: var(--surface); padding: 15px 10px 25px 10px; border-top: 1px solid rgba(255,255,255,0.05); border-radius: 24px 24px 0 0; box-shadow: 0 -10px 20px rgba(0,0,0,0.3); z-index: 100; }
      .nav-container { display: flex; justify-content: space-around; align-items: center; }
      .nav-item { background: transparent; border: none; display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
      .icon-wrapper { padding: 10px; border-radius: 16px; transition: all 0.2s; }
      .nav-label { font-size: 11px; font-weight: 600; }
      
      .nav-item.active-blue { color: var(--color-blue); }
      .nav-item.active-blue .icon-wrapper { background: rgba(59, 130, 246, 0.15); }
      .nav-item.active-green { color: var(--color-green); }
      .nav-item.active-green .icon-wrapper { background: rgba(16, 185, 129, 0.15); }
      .nav-item.active-orange { color: var(--color-orange); }
      .nav-item.active-orange .icon-wrapper { background: rgba(245, 158, 11, 0.15); }
      .nav-item.active-red { color: var(--color-red); }
      .nav-item.active-red .icon-wrapper { background: rgba(239, 68, 68, 0.15); }

      /* Dashboard */
      .welcome-banner { background-color: var(--color-blue-dark); color: white; border: none; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); }
      .welcome-banner h2 { margin-top: 0; font-size: 20px; }
      .progress-bar-container { background: rgba(0,0,0,0.3); height: 10px; border-radius: 5px; margin-top: 15px; overflow: hidden; }
      .progress-fill { background: var(--color-orange); height: 100%; border-radius: 5px; transition: width 0.5s ease; }
      
      .section-title { font-size: 18px; margin: 25px 0 15px 5px; color: var(--text-muted); }
      .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .action-card { padding: 15px; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 10px; }
      .action-card.full-width { grid-column: 1 / -1; flex-direction: row; align-items: center; }
      .action-card h4 { margin: 0; font-size: 15px; }
      .action-card p { margin: 0; font-size: 12px; color: var(--text-muted); }
      .card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
      .green-icon { background: rgba(16, 185, 129, 0.15); color: var(--color-green); }
      .red-icon { background: rgba(239, 68, 68, 0.15); color: var(--color-red); }
      .orange-icon { background: rgba(245, 158, 11, 0.15); color: var(--color-orange); }

      /* Mochila */
      .books-list { display: flex; flex-direction: column; gap: 15px; }
      .book-item { display: flex; align-items: center; gap: 15px; padding: 15px; cursor: pointer; }
      .book-icon { font-size: 30px; background: var(--bg-main); padding: 10px; border-radius: 12px; box-shadow: var(--shadow-inset); }
      .book-details h4 { margin: 0 0 5px 0; }
      .book-details span { color: var(--text-muted); font-size: 13px; }

      /* Modal de Resultados */
      .search-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .modal-content { width: 100%; max-width: 400px; position: relative; }
      .close-btn { position: absolute; top: 15px; right: 15px; background: var(--bg-main); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; font-weight: bold; box-shadow: var(--shadow-dark); }
      .result-card { display: block; padding: 15px; background: var(--bg-main); border-radius: 12px; margin-top: 10px; text-decoration: none; color: white; box-shadow: var(--shadow-inset); border: 1px solid rgba(255,255,255,0.05); }
      .res-badge { background: var(--color-blue); font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: bold; }
      .result-card p { margin: 10px 0 0 0; font-size: 14px; font-weight: 500; }

      /* Quiz */
      .arena-stats { display: flex; justify-content: center; gap: 20px; margin: 20px 0 30px 0; background: var(--bg-main); padding: 15px; border-radius: 12px; box-shadow: var(--shadow-inset); }
      .quiz-badge { background: var(--color-orange); color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      .question-text { font-size: 18px; margin: 20px 0 30px 0; line-height: 1.4; }
      .options-grid { display: flex; flex-direction: column; gap: 15px; }
      .option-btn { background: var(--surface-hover); color: white; text-align: left; font-weight: normal; }
      .victory-icon { font-size: 60px; margin-bottom: 20px; animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    `}} />
  );
}

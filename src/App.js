import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, collection, query, 
  where, getDocs, updateDoc, addDoc, serverTimestamp, 
  setDoc, deleteDoc, increment 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC2HOMgI15hXf-0YhceNWmj9dppl1sXi8s",
  authDomain: "estudo-magico-3276c.firebaseapp.com",
  projectId: "estudo-magico-3276c",
  storageBucket: "estudo-magico-3276c.appspot.com",
  messagingSenderId: "17316174654",
  appId: "1:17316174654:web:a98e122832c2f0b44cea6f",
  measurementId: "G-Q4BEFNJZC8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function EstudoMagico() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [adminData, setAdminData] = useState({ users: [], totalXP: 0 });
  const [systemAlert, setSystemAlert] = useState(null);
  const [isShutdown, setIsShutdown] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUser({ uid: authUser.uid, ...data });
            if (data.status === 'shutdown') setIsShutdown(true);
          } else {
            setDoc(userRef, { 
              name: "Simão", 
              xp: 200, 
              level: 7, 
              isAdmin: true, 
              status: 'active',
              lastSeen: serverTimestamp()
            });
          }
        });
      } else {
        signInAnonymously(auth);
      }
      setLoading(false);
    });

    const unsubAlert = onSnapshot(doc(db, 'system', 'broadcast'), (snap) => {
      if (snap.exists() && snap.data().message) {
        setSystemAlert(snap.data().message);
        setTimeout(() => setSystemAlert(null), 8000); 
      }
    });

    const unsubGlobal = onSnapshot(doc(db, 'system', 'config'), (snap) => {
      if (snap.exists() && snap.data().maintenance) setIsShutdown(true);
    });

    return () => { unsubAuth(); unsubAlert(); unsubGlobal(); };
  }, []);

  const processAIResponse = (text) => {
    const input = text.toLowerCase();
    if (input.includes("olá") || input.includes("boas")) return "Olá! O que vamos dominar hoje no 7.º ano? 🚀";
    if (input.includes("quiz") || input.includes("testar")) return "Claro! Ativa o Modo Quiz no menu para começarmos o desafio. 🧠";
    if (input.includes("ajuda")) return "Posso ajudar-te com resumos ou revisões. Qual é o tema? 📚";
    if (input.includes("xp")) return `Atualmente tens ${user?.xp} XP. Continua a focar-te! ⚡`;
    return "Excelente pergunta. Vou preparar um plano de estudo sobre isso! ✨";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = { text: inputText, sender: 'user', id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTimeout(() => {
      const response = processAIResponse(userMsg.text);
      setMessages(prev => [...prev, { text: response, sender: 'ai', id: Date.now() + 1 }]);
    }, 800);
  };

  useEffect(() => {
    if (user?.isAdmin && activeTab === 'admin') {
      const q = query(collection(db, 'users'));
      const unsubUsers = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const total = list.reduce((acc, val) => acc + (val.xp || 0), 0);
        setAdminData({ users: list, totalXP: total });
      });
      return () => unsubUsers();
    }
  }, [user, activeTab]);

  const triggerGlobalMessage = async () => {
    const msg = prompt("Escreve a mensagem de sistema:");
    if (msg) await setDoc(doc(db, 'system', 'broadcast'), { message: msg, timestamp: serverTimestamp() });
  };

  const toggleUserStatus = async (targetId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'shutdown' : 'active';
    await updateDoc(doc(db, 'users', targetId), { status: newStatus });
  };

  const emergencyShutdown = async () => {
    if (window.confirm("DESLIGAR SISTEMA PARA TODOS?")) {
      await updateDoc(doc(db, 'system', 'config'), { maintenance: true });
    }
  };

  if (loading) return <div className="loader">A iniciar sistema...</div>;
  if (isShutdown) return <div className="blocked">ACESSO NEGADO PELO ADMIN</div>;

  return (
    <div className="app-container">
      {systemAlert && (
        <div className="alert-overlay">
          <div className="alert-card">
            <p>AVISO DO SISTEMA: {systemAlert}</p>
          </div>
        </div>
      )}

      <header className="top-header">
        <div className="logo-section">
          <span className="logo-text">ESTUDO MÁGICO</span>
          <span className="version-tag">BUILD 2026.5</span>
        </div>
        <div className="user-stats">
          <span className="stat-badge">XP: {user?.xp}</span>
          <span className="stat-badge">NÍVEL: {user?.level}</span>
          {user?.isAdmin && <span className="admin-badge">ADMIN</span>}
        </div>
      </header>

      <nav className="centered-menu">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
          Painel Principal
        </button>
        <button onClick={() => setActiveTab('quiz')} className={activeTab === 'quiz' ? 'active' : ''}>
          Modo Quiz
        </button>
        <button onClick={() => setActiveTab('test')} className={activeTab === 'test' ? 'active' : ''}>
          Testes
        </button>
        {user?.isAdmin && (
          <button onClick={() => setActiveTab('admin')} className={`admin-btn ${activeTab === 'admin' ? 'active' : ''}`}>
            Controlo Admin
          </button>
        )}
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="chat-interface">
            <div className="chat-history" ref={chatRef}>
              <div className="msg ai-msg">SISTEMA: Olá! Tudo operacional para o estudo de hoje.</div>
              {messages.map((m) => (
                <div key={m.id} className={`msg ${m.sender === 'user' ? 'user-msg' : 'ai-msg'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="chat-controls">
              <input 
                placeholder="Escreve aqui o que precisas..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="admin-panel">
            <h2>Consola de Administração Central</h2>
            <div className="admin-stats-grid">
              <div className="stat-box">Total de Utilizadores: {adminData.users.length}</div>
              <div className="stat-box">XP Total Global: {adminData.totalXP}</div>
            </div>
            <div className="admin-actions">
              <button onClick={triggerGlobalMessage} className="action-btn">Criar Alerta Global</button>
              <button onClick={emergencyShutdown} className="action-btn danger">Desligar Servidores</button>
            </div>
            <div className="users-list">
              {adminData.users.map(u => (
                <div key={u.id} className="user-row">
                  <span className="user-info">{u.name} | XP: {u.xp} | Estado: {u.status}</span>
                  <button onClick={() => toggleUserStatus(u.id, u.status)} className="toggle-btn">
                    {u.status === 'active' ? 'Banir' : 'Restaurar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="quiz-section">
            <h2>Módulo de Quiz</h2>
            <div className="quiz-question-box">
              <h3>Como funciona o ciclo da água?</h3>
              <div className="answers-grid">
                <button onClick={() => alert("Tenta de novo!")}>Apenas evaporação</button>
                <button onClick={() => alert("Certo! Ganhaste XP.")}>Evaporação, condensação e precipitação</button>
                <button onClick={() => alert("Incorreto.")}>Apenas chuva</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        :root {
          --bg-color: #0a0a0a;
          --surface-color: #141414;
          --border-color: #2a2a2a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --accent-color: #3b82f6;
          --danger-color: #ef4444;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: var(--bg-color);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--surface-color);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .version-tag {
          margin-left: 10px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .user-stats {
          display: flex;
          gap: 15px;
        }

        .stat-badge {
          background-color: var(--bg-color);
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          font-size: 14px;
        }

        .admin-badge {
          background-color: var(--danger-color);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
        }

        .centered-menu {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 30px;
          background-color: var(--bg-color);
        }

        .centered-menu button {
          background-color: var(--surface-color);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .centered-menu button:hover {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }

        .centered-menu button.active {
          background-color: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .main-content {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 20px;
        }

        .chat-interface {
          width: 100%;
          max-width: 800px;
          background-color: var(--surface-color);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 60vh;
        }

        .chat-history {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .msg {
          padding: 15px 20px;
          border-radius: 8px;
          max-width: 75%;
          line-height: 1.5;
        }

        .ai-msg {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          align-self: flex-start;
          color: var(--text-secondary);
        }

        .user-msg {
          background-color: var(--accent-color);
          color: white;
          align-self: flex-end;
        }

        .chat-controls {
          display: flex;
          padding: 20px;
          background-color: var(--bg-color);
          border-top: 1px solid var(--border-color);
          gap: 15px;
        }

        .chat-controls input {
          flex: 1;
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          color: white;
          padding: 15px;
          border-radius: 6px;
          font-size: 16px;
          outline: none;
        }

        .chat-controls input:focus {
          border-color: var(--accent-color);
        }

        .chat-controls button {
          background-color: var(--accent-color);
          color: white;
          border: none;
          padding: 0 30px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }

        .admin-panel {
          width: 100%;
          max-width: 900px;
          background-color: var(--surface-color);
          border-radius: 12px;
          padding: 40px;
          border: 1px solid var(--border-color);
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-box {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          padding: 25px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 500;
        }

        .admin-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 40px;
        }

        .action-btn {
          background-color: var(--bg-color);
          color: white;
          border: 1px solid var(--border-color);
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
        }

        .action-btn.danger {
          border-color: var(--danger-color);
          color: var(--danger-color);
        }

        .users-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .user-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-color);
          padding: 15px 20px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .toggle-btn {
          background-color: transparent;
          color: white;
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .quiz-section {
          width: 100%;
          max-width: 800px;
        }

        .quiz-question-box {
          background-color: var(--surface-color);
          padding: 40px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-top: 20px;
        }

        .answers-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 30px;
        }

        .answers-grid button {
          background-color: var(--bg-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 20px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          text-align: left;
        }

        .answers-grid button:hover {
          border-color: var(--accent-color);
        }

        .alert-overlay {
          position: fixed;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .alert-card {
          background-color: var(--danger-color);
          color: white;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: bold;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .loader, .blocked {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 24px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

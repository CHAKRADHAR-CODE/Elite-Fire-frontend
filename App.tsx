
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { stateService } from './services/stateService';
import { I18N } from './constants';
import { 
  Trophy, 
  Wallet, 
  History, 
  Bell, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle, 
  UserCog,
  FileText,
  Menu,
  X,
  Flame,
  Target,
  Zap,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TeamBuilder from './pages/TeamBuilder';
import MatchResults from './pages/MatchResults';
import WalletPage from './pages/WalletPage';
import UserManagement from './pages/UserManagement';
import DebtorsPage from './pages/DebtorsPage';
import NotificationPage from './pages/NotificationPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MatchHistory from './pages/MatchHistory';

// Contexts
const LanguageContext = createContext({ 
  lang: 'en' as keyof typeof I18N, 
  setLang: (l: keyof typeof I18N) => {},
  t: (key: string) => '' 
});
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export const useTranslation = () => useContext(LanguageContext);
export const useTheme = () => useContext(ThemeContext);

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-widest border border-transparent ${
        isActive 
        ? 'bg-[#ff4d00] text-white shadow-[0_0_20px_rgba(255,77,0,0.5)] border-[#ff4d00]/30' 
        : 'text-gray-500 hover:text-[#ff4d00] hover:bg-[#ff4d00]/5 dark:hover:text-white dark:hover:bg-white/5'
      }`}
    >
      <div className={`${isActive ? 'text-white' : ''}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

const TacticalToast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => (
  <motion.div 
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    role="status"
    aria-live="polite"
    className="fixed bottom-10 right-10 z-[200] bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-l-4 border-[#ff4d00] p-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm"
  >
    <div className="bg-[#ff4d00]/20 p-2 rounded-lg text-[#ff4d00]">
      <Zap size={20} className="animate-pulse" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-[#ff4d00] uppercase tracking-[0.2em] mb-1">Incoming Signal</p>
      <p className="text-xs text-gray-900 dark:text-white font-bold leading-snug">{message}</p>
    </div>
    <button onClick={onClose} aria-label="Dismiss notification" className="text-gray-400 hover:text-red-500 transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const AppContent: React.FC<{ currentUser: User, setCurrentUser: (u: User | null) => void }> = ({ currentUser, setCurrentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  // Fixed async notification fetching logic
  useEffect(() => {
    let lastNotifCount = 0;
    
    const fetchNotifications = async () => {
      try {
        const notifications = await stateService.getNotifications(currentUser.id);
        const newCount = notifications.length;
        setUnreadCount(notifications.filter(n => !n.isRead).length);
        
        if (newCount > lastNotifCount && lastNotifCount !== 0) {
          setActiveToast(notifications[notifications.length - 1].message);
          setTimeout(() => setActiveToast(null), 5000);
        }
        lastNotifCount = newCount;
      } catch (err) {
        console.error("Signal Retrieval Failed", err);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleLogout = () => {
    localStorage.removeItem('efb_current_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gaming-gradient transition-colors duration-500">
      <AnimatePresence>
        {activeToast && <TacticalToast message={activeToast} onClose={() => setActiveToast(null)} />}
      </AnimatePresence>

      <header className="md:hidden flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/90 backdrop-blur-xl sticky top-0 z-50">
        <button onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar menu" className="p-2 text-gray-400">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Flame className="text-[#ff4d00]" size={24} />
          <h1 className="font-gaming font-black text-lg text-gray-900 dark:text-white italic">ELITE FIRE</h1>
        </div>
        <Link to="/notifications" aria-label={`View notifications, ${unreadCount} unread`} className="relative p-2 text-gray-400">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#ff4d00] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg">
              {unreadCount}
            </span>
          )}
        </Link>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 glass-panel transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} aria-label="Main Navigation">
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                <Flame className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-gaming font-black text-xl leading-none text-gray-900 dark:text-white tracking-tighter italic">ELITE FIRE</h1>
                <span className="text-[8px] tracking-[0.4em] text-[#ff4d00] font-black uppercase">SIGNAL v5.2</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar" className="md:hidden text-gray-500 hover:text-[#ff4d00]">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2 mb-8 p-1.5 bg-gray-200/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
             <button 
              onClick={toggleTheme} 
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all text-gray-500 hover:text-[#ff4d00]"
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} 
              aria-label={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
              className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all text-gray-500 hover:text-[#ff4d00] font-black text-[10px]"
             >
               <Globe size={18} className="mr-1.5" /> {lang.toUpperCase()}
             </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar" role="menu">
            <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label={t('dashboard')} onClick={() => setIsSidebarOpen(false)} />
            {(currentUser.role === UserRole.ADMIN || currentUser.canCreateMatch) && (
              <SidebarLink to="/team-builder" icon={<PlusCircle size={18} />} label={t('squad_builder')} onClick={() => setIsSidebarOpen(false)} />
            )}
            <SidebarLink to="/match-results" icon={<Target size={18} />} label={t('battle_results')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/match-history" icon={<History size={18} />} label={t('combat_logs')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/leaderboard" icon={<Trophy size={18} />} label={t('rankings')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/wallet" icon={<Wallet size={18} />} label={t('wallet')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/notifications" icon={
              <div className="relative">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-[#ff4d00] w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,77,0,1)]"></span>}
              </div>
            } label={t('notifications')} onClick={() => setIsSidebarOpen(false)} />

            {currentUser.role === UserRole.ADMIN && (
              <>
                <div className="pt-10 pb-4">
                  <span className="px-6 text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em]">High Command</span>
                </div>
                <SidebarLink to="/admin/users" icon={<UserCog size={18} />} label="OPERATIVE TERMINAL" onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/admin/debtors" icon={<FileText size={18} />} label="CREDIT AUDIT" onClick={() => setIsSidebarOpen(false)} />
              </>
            )}
          </nav>

          <div className="mt-auto pt-10 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-4 p-5 bg-gray-200/50 dark:bg-white/5 rounded-3xl mb-6 border border-black/5 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-[#ff4d00]/10 flex items-center justify-center font-black text-xl text-[#ff4d00] shadow-inner">
                {currentUser.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase font-gaming">{currentUser.username}</p>
                <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase">{currentUser.role === UserRole.ADMIN ? 'COMMANDER' : 'OPERATIVE'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar" aria-label="Page Content">
        <div className="hidden md:flex items-center justify-between mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-gaming font-black text-gray-900 dark:text-white italic tracking-tighter">
              {t('status')}: <span className="text-[#ff4d00] animate-pulse">{t('active')}</span>
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">GRID SYNCHRONIZED • {t('welcome')} {currentUser.username.toUpperCase()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-panel px-10 py-5 rounded-3xl border border-black/5 dark:border-white/10 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4d00]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Wallet className="text-[#ff4d00]" size={28} />
              <div>
                <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase">{t('credits')}</p>
                <p className={`text-2xl font-gaming font-black ${currentUser.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                  ₹{currentUser.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard user={currentUser} />} />
          <Route path="/team-builder" element={(currentUser.role === UserRole.ADMIN || currentUser.canCreateMatch) ? <TeamBuilder /> : <Navigate to="/" />} />
          <Route path="/match-results" element={<MatchResults user={currentUser} />} />
          <Route path="/match-history" element={<MatchHistory user={currentUser} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={currentUser} />} />
          <Route path="/wallet" element={<WalletPage user={currentUser} />} />
          <Route path="/notifications" element={<NotificationPage user={currentUser} />} />
          <Route path="/admin/users" element={currentUser.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />} />
          <Route path="/admin/debtors" element={currentUser.role === UserRole.ADMIN ? <DebtorsPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<keyof typeof I18N>(() => (localStorage.getItem('efb_lang') as any) || 'en');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('efb_theme') as any) || 'dark');

  // Fixed async user verification at startup
  useEffect(() => {
    const checkSavedUser = async () => {
      const savedUser = localStorage.getItem('efb_current_user');
      if (savedUser) {
        try {
          const u = await stateService.getUserById(JSON.parse(savedUser).id);
          if (u) {
            if (u.isBlocked) {
              alert('ACCESS DENIED: Signal Termination - Account blocked by Command.');
              localStorage.removeItem('efb_current_user');
              setCurrentUser(null);
            } else {
              setCurrentUser(u);
            }
          }
        } catch (err) {
          console.error("Auth Cycle Error", err);
        }
      }
    };
    checkSavedUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('efb_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('efb_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const t = (key: string) => {
    const section = I18N[lang] as any;
    return section[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') }}>
        <HashRouter>
          {!currentUser ? (
            <LoginPage onLogin={setCurrentUser} />
          ) : (
            <AppContent currentUser={currentUser} setCurrentUser={setCurrentUser} />
          )}
        </HashRouter>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;


import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from './types.ts';
import { stateService } from './services/stateService.ts';
import { I18N } from './constants.tsx';
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

// Pages - Added .tsx extensions for browser ESM resolution
import LoginPage from './pages/LoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TeamBuilder from './pages/TeamBuilder.tsx';
import MatchResults from './pages/MatchResults.tsx';
import WalletPage from './pages/WalletPage.tsx';
import UserManagement from './pages/UserManagement.tsx';
import DebtorsPage from './pages/DebtorsPage.tsx';
import NotificationPage from './pages/NotificationPage.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import MatchHistory from './pages/MatchHistory.tsx';

// Contexts
const LanguageContext = createContext({ 
  lang: 'en' as keyof typeof I18N, 
  setLang: (l: keyof typeof I18N) => {},
  t: (key: string) => '' 
});
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
const UserContext = createContext<{ currentUser: User | null, setCurrentUser: (u: User | null) => void }>({ currentUser: null, setCurrentUser: () => {} });

export const useTranslation = () => useContext(LanguageContext);
export const useTheme = () => useContext(ThemeContext);
export const useUser = () => useContext(UserContext);

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
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
    className="fixed bottom-10 right-10 z-[200] bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-l-4 border-[#ff4d00] p-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm"
  >
    <div className="bg-[#ff4d00]/20 p-2 rounded-lg text-[#ff4d00]">
      <Zap size={20} className="animate-pulse" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-[#ff4d00] uppercase tracking-[0.2em] mb-1">Incoming Signal</p>
      <p className="text-xs text-gray-900 dark:text-white font-bold leading-snug">{message}</p>
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!currentUser) return;
    let lastNotifCount = 0;
    
    const fetchNotifications = async () => {
      try {
        const notifications = await stateService.getNotifications(currentUser.id || (currentUser as any)._id);
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
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gaming-gradient transition-colors duration-500">
      <AnimatePresence>
        {activeToast && <TacticalToast message={activeToast} onClose={() => setActiveToast(null)} />}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 glass-panel transform transition-transform duration-500 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ff4d00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                <Flame className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-gaming font-black text-xl leading-none text-gray-900 dark:text-white tracking-tighter italic">ELITE FIRE</h1>
                <span className="text-[8px] tracking-[0.4em] text-[#ff4d00] font-black uppercase">SIGNAL v5.3</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2 mb-8 p-1.5 bg-gray-200/50 dark:bg-white/5 rounded-2xl">
             <button onClick={toggleTheme} className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all text-gray-500 hover:text-[#ff4d00]">
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all text-gray-500 hover:text-[#ff4d00] font-black text-[10px]">
               <Globe size={18} className="mr-1.5" /> {lang.toUpperCase()}
             </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label={t('dashboard')} onClick={() => setIsSidebarOpen(false)} />
            {(currentUser.role === UserRole.ADMIN || currentUser.canCreateMatch) && (
              <SidebarLink to="/team-builder" icon={<PlusCircle size={18} />} label={t('squad_builder')} onClick={() => setIsSidebarOpen(false)} />
            )}
            <SidebarLink to="/match-results" icon={<Target size={18} />} label={t('battle_results')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/match-history" icon={<History size={18} />} label={t('combat_logs')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/leaderboard" icon={<Trophy size={18} />} label={t('rankings')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/wallet" icon={<Wallet size={18} />} label={t('wallet')} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/notifications" icon={<Bell size={18} />} label={t('notifications')} onClick={() => setIsSidebarOpen(false)} />

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
            <button 
              onClick={() => setCurrentUser(null)}
              className="w-full flex items-center justify-center gap-3 py-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
        <Routes>
          <Route path="/" element={<Dashboard user={currentUser} />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
          <Route path="/match-results" element={<MatchResults user={currentUser} />} />
          <Route path="/match-history" element={<MatchHistory user={currentUser} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={currentUser} />} />
          <Route path="/wallet" element={<WalletPage user={currentUser} />} />
          <Route path="/notifications" element={<NotificationPage user={currentUser} />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/debtors" element={<DebtorsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<keyof typeof I18N>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const t = (key: string) => (I18N[lang] as any)[key] || key;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') }}>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </ThemeContext.Provider>
      </LanguageContext.Provider>
    </UserContext.Provider>
  );
};

export default App;

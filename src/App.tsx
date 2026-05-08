import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, orderBy, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Droplets, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Search, 
  X,
  History, 
  DollarSign,
  Wrench,
  Users,
  MapPin,
  Phone,
  BarChart3,
  Calendar,
  ChevronRight,
  Languages,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react';
import { Vehicle, Maintenance, VehicleIncome, Dealer, WaterSale, CompanyExpense } from './types';
import { translations, Language } from './locales';

// --- Sub-components (Drafts) ---
import Dashboard from './components/Dashboard';
import VehicleManager from './components/VehicleManager';
import DealerManager from './components/DealerManager';
import ExpenseManager from './components/ExpenseManager';
import DriverManager from './components/DriverManager';
import CNGManager from './components/CNGManager';
import ReportsManager from './components/ReportsManager';

import ConfirmModal from './components/ui/ConfirmModal';

export default function App() {
  const [user, setUser] = useState<{ uid: string } | null>(() => {
    return localStorage.getItem('milad_admin_session') === 'active' ? { uid: 'admin' } : null;
  });
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'dealers' | 'expenses' | 'drivers' | 'cng' | 'reports'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('milad_water_theme') === 'dark';
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const ADMIN_USERNAME = "Admin";
  const ADMIN_PASSWORD = "Milad2006";

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('milad_water_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('milad_water_theme', 'light');
    }
  }, [isDarkMode]);

  const t = translations[lang];

  const toggleLang = () => setLang(prev => prev === 'bn' ? 'en' : 'bn');
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const handleLogout = async () => {
    localStorage.removeItem('milad_admin_session');
    setUser(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'dark bg-slate-950' : 'bg-bg-warm'}`}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className={isDarkMode ? 'text-white font-semibold' : 'text-ink font-semibold'}
        >
          {t.loading}
        </motion.div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Simulate login delay
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('milad_admin_session', 'active');
        setUser({ uid: 'admin' });
      } else {
        setLoginError('Invalid Username or Password');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  if (!user) {
    return (
      <div className={`flex items-center justify-center h-screen px-4 ${isDarkMode ? 'dark bg-slate-950' : 'bg-bg-warm'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-dark-surface p-8 lg:p-10 rounded-[40px] shadow-2xl shadow-blue-500/10 border border-gray-50 dark:border-dark-border"
        >
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Droplets className="text-blue-600 dark:text-blue-400 w-10 h-10" />
          </div>
          <h1 className={`text-3xl font-black mb-2 text-center ${isDarkMode ? 'text-white' : 'text-ink'}`}>{t.welcome}</h1>
          <p className="text-gray-400 dark:text-dark-muted mb-8 text-sm text-center">{t.address}</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">Username</label>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-5 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              />
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2"
              >
                <Plus size={14} className="rotate-45" /> {loginError}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-8 text-[10px] text-center text-gray-300 dark:text-dark-muted uppercase tracking-[0.2em] font-bold">{t.appName}</p>
        </motion.div>
      </div>
    );
  }


  return (
    <div className={`flex h-screen overflow-hidden safe-top safe-bottom select-none ${isDarkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-bg-warm text-ink'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-100 dark:border-dark-border flex flex-col h-full hidden lg:flex">
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-xl p-2">
              <Droplets className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none dark:text-white">MILAD</span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-gray-400">WATER & TRANSPORT</span>
            </div>
          </div>
          
          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">{t.dashboard}</p>
              <NavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                icon={<LayoutDashboard size={18} />} 
                label={t.dashboard} 
              />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">{t.miladWater}</p>
              <div className="space-y-1">
                <NavItem 
                  active={activeTab === 'dealers'} 
                  onClick={() => setActiveTab('dealers')} 
                  icon={<Users size={18} />} 
                  label={t.dealers} 
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">{t.anikaTransport}</p>
              <div className="space-y-1">
                <NavItem 
                  active={activeTab === 'vehicles'} 
                  onClick={() => setActiveTab('vehicles')} 
                  icon={<Truck size={18} />} 
                  label={t.vehicles} 
                />
                <NavItem 
                  active={activeTab === 'drivers'} 
                  onClick={() => setActiveTab('drivers')} 
                  icon={<Users size={18} />} 
                  label={t.drivers} 
                />
                <NavItem 
                  active={activeTab === 'cng'} 
                  onClick={() => setActiveTab('cng')} 
                  icon={<Truck size={18} />} 
                  label={t.cng} 
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">{t.expenses} & {t.reports}</p>
              <div className="space-y-1">
                <NavItem 
                  active={activeTab === 'expenses'} 
                  onClick={() => setActiveTab('expenses')} 
                  icon={<DollarSign size={18} />} 
                  label={t.expenses} 
                />
                <NavItem 
                  active={activeTab === 'reports'} 
                  onClick={() => setActiveTab('reports')} 
                  icon={<BarChart3 size={18} />} 
                  label={t.reports} 
                />
              </div>
            </div>
          </nav>
        </div>
        
        <div className="p-6 border-t border-gray-50 dark:border-dark-border flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-bg rounded-xl">
             <button onClick={toggleDarkMode} className="text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white">
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button onClick={toggleLang} className="text-xs font-bold text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white">
               {lang.toUpperCase()}
             </button>
             <button onClick={() => setIsLogoutModalOpen(true)} className="text-red-500 hover:text-red-600">
               <LogOut size={18} />
             </button>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-ink dark:text-white truncate">Admin</p>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-dark-surface px-4 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg shadow-blue-500/20">
              <Droplets className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-lg dark:text-white tracking-tight">MILAD</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-gray-50 dark:bg-dark-bg rounded-full px-2 py-1">
                <button onClick={toggleLang} className="px-2 py-1 text-[10px] font-bold text-gray-500 dark:text-dark-muted">
                   {lang.toUpperCase()}
                </button>
                <div className="w-px h-3 bg-gray-200 dark:bg-dark-border mx-1" />
                <button onClick={toggleDarkMode} className="p-1 px-2 text-gray-500 dark:text-dark-muted">
                   {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
             </div>
            <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-28 lg:pb-10 bg-bg-warm dark:bg-dark-bg transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard lang={lang} />}
              {activeTab === 'vehicles' && <VehicleManager lang={lang} />}
              {activeTab === 'dealers' && <DealerManager lang={lang} />}
              {activeTab === 'expenses' && <ExpenseManager lang={lang} />}
              {activeTab === 'drivers' && <DriverManager lang={lang} />}
              {activeTab === 'cng' && <CNGManager lang={lang} />}
              {activeTab === 'reports' && <ReportsManager lang={lang} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pb-6 z-40">
           <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-gray-100 dark:border-dark-border p-2 rounded-[32px] shadow-2xl flex justify-between items-center overflow-x-auto no-scrollbar scroll-smooth">
              <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label={t.dashboard} />
              <MobileNavItem active={activeTab === 'dealers'} onClick={() => setActiveTab('dealers')} icon={<Droplets size={20} />} label={t.dealers} />
              <MobileNavItem active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} icon={<Truck size={20} />} label={t.vehicles} />
              <MobileNavItem active={activeTab === 'cng'} onClick={() => setActiveTab('cng')} icon={<Smartphone size={20} />} label={t.cng} />
              <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarSign size={20} />} label={t.expenses} />
              <MobileNavItem active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={20} />} label={t.drivers} />
              <MobileNavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20} />} label={t.reports} />
           </div>
        </nav>

        <ConfirmModal 
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title={t.logout}
          message={lang === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?'}
          confirmText={t.logout}
          cancelText={t.close}
          isDanger={true}
        />
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-ink dark:bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
          : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
      {active && <motion.div layoutId="activeBall" className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
    </button>
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 min-w-[56px] sm:min-w-[64px] rounded-2xl transition-all ${
        active 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
          : 'text-gray-400 dark:text-dark-muted'
      }`}
    >
      {icon}
      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{label}</span>
    </button>
  );
}


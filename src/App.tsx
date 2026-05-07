import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, loginAnonymously, logout, auth, signInWithGoogle } from './lib/firebase';
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
  Sun
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

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'dealers' | 'expenses' | 'drivers' | 'cng' | 'reports'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('milad_water_theme') === 'dark';
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      await logout();
    }
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

  if (!user) {
    return (
      <div className={`flex items-center justify-center h-screen px-4 text-center ${isDarkMode ? 'dark bg-slate-950' : 'bg-bg-warm'}`}>
        <div className="max-w-md w-full bg-white dark:bg-dark-surface p-10 rounded-[40px] shadow-2xl shadow-blue-500/10 border border-gray-50 dark:border-dark-border">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Droplets className="text-blue-600 dark:text-blue-400 w-10 h-10" />
          </div>
          <h1 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-ink'}`}>{t.welcome}</h1>
          <p className="text-gray-400 dark:text-dark-muted mb-8 text-sm">{t.address}</p>
          
          <button 
            onClick={() => signInWithGoogle()} 
            className="w-full flex items-center justify-center gap-3 bg-ink dark:bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
            {t.googleLogin}
          </button>

          <p className="mt-8 text-[10px] text-gray-300 dark:text-dark-muted uppercase tracking-[0.2em] font-bold">{t.appName}</p>
        </div>
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
             <button onClick={handleLogout} className="text-red-500 hover:text-red-600">
               <LogOut size={18} />
             </button>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border-2 border-blue-500" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-ink dark:text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-dark-surface px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
           <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Droplets className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-lg dark:text-white">MILAD</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="text-gray-400 dark:text-dark-muted">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLogout} className="text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10 bg-bg-warm dark:bg-dark-bg transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-t border-gray-100 dark:border-dark-border px-6 py-3 flex justify-between z-40">
           <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} />
           <MobileNavItem active={activeTab === 'dealers'} onClick={() => setActiveTab('dealers')} icon={<Droplets size={22} />} />
           <MobileNavItem active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} icon={<Truck size={22} />} />
           <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarSign size={22} />} />
        </nav>
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

function MobileNavItem({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all ${
        active 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
          : 'text-gray-400 dark:text-dark-muted'
      }`}
    >
      {icon}
    </button>
  );
}


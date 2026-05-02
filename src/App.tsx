import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, loginAnonymously, logout, auth } from './lib/firebase';
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

export default function App() {
  const [user, setUser] = useState<{ displayName: string; photoURL: string } | null>({ 
    displayName: 'Admin Account', 
    photoURL: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff' 
  });
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'dealers' | 'expenses'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('milad_water_theme') === 'dark';
  });

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

  const handleLogout = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      setUser(null);
      setTimeout(() => window.location.reload(), 500);
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
        <div>
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-ink'}`}>{t.appName}</h1>
          <button onClick={() => window.location.reload()} className="bg-ink dark:bg-blue-600 text-white px-6 py-2 rounded-xl">
             Reload to Login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className={`flex h-screen overflow-hidden safe-top safe-bottom select-none ${isDarkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-bg-warm text-ink'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-100 dark:border-dark-border flex flex-col h-full hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Droplets className="text-blue-600 dark:text-blue-400 w-8 h-8" />
            <span className="font-bold text-xl tracking-tight dark:text-white">Milad Drinking Water</span>
          </div>
          
          <nav className="space-y-1">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label={t.dashboard} 
            />
            <NavItem 
              active={activeTab === 'vehicles'} 
              onClick={() => setActiveTab('vehicles')} 
              icon={<Truck size={20} />} 
              label={t.vehicles} 
            />
            <NavItem 
              active={activeTab === 'dealers'} 
              onClick={() => setActiveTab('dealers')} 
              icon={<Users size={20} />} 
              label={t.dealers} 
            />
            <NavItem 
              active={activeTab === 'expenses'} 
              onClick={() => setActiveTab('expenses')} 
              icon={<DollarSign size={20} />} 
              label={t.expenses} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-50 dark:border-dark-border flex flex-col gap-4">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white font-medium transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? (lang === 'bn' ? 'লাইট মোড' : 'Light Mode') : (lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode')}
          </button>
          
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white font-medium transition-colors"
          >
            <Languages size={18} />
            {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          </button>
          
          <div className="flex items-center gap-3 border-t border-gray-50 dark:border-dark-border pt-4">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-ink dark:text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 dark:text-dark-muted truncate">Milad Drinking Water</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-dark-surface px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
           <div className="flex items-center gap-2">
            <Droplets className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <span className="font-bold text-lg dark:text-white">Milad Drinking Water</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="text-gray-400 dark:text-dark-muted">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleLang} className="text-gray-400 dark:text-dark-muted">
              <Languages size={20} />
            </button>
            <button onClick={handleLogout} className="text-gray-400 dark:text-dark-muted text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10 bg-bg-warm dark:bg-dark-bg transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard lang={lang} />}
              {activeTab === 'vehicles' && <VehicleManager lang={lang} />}
              {activeTab === 'dealers' && <DealerManager lang={lang} />}
              {activeTab === 'expenses' && <ExpenseManager lang={lang} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg border-t border-gray-100 dark:border-dark-border px-6 py-3 flex justify-between z-40">
           <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} />
           <MobileNavItem active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} icon={<Truck size={24} />} />
           <MobileNavItem active={activeTab === 'dealers'} onClick={() => setActiveTab('dealers')} icon={<Users size={24} />} />
           <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarSign size={24} />} />
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


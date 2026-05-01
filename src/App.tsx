import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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
  Languages
} from 'lucide-react';
import { Vehicle, Maintenance, VehicleIncome, Dealer, WaterSale, CompanyExpense } from './types';
import { translations, Language } from './locales';

// --- Sub-components (Drafts) ---
import Dashboard from './components/Dashboard';
import VehicleManager from './components/VehicleManager';
import DealerManager from './components/DealerManager';
import ExpenseManager from './components/ExpenseManager';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'dealers' | 'expenses'>('dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleLang = () => setLang(prev => prev === 'bn' ? 'en' : 'bn');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-warm">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-ink font-semibold"
        >
          {t.loading}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-warm px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center"
        >
          <div className="mb-6 flex justify-center flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Droplets className="w-12 h-12 text-blue-600" />
            </div>
            <button 
              onClick={toggleLang}
              className="px-4 py-2 bg-gray-50 rounded-full text-xs font-bold border border-gray-100 flex items-center gap-2"
            >
              <Languages size={14} />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">{t.appName}</h1>
          <p className="text-gray-500 mb-8">{t.welcome}</p>
          
          <AnimatePresence>
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-center gap-2 border border-red-100"
              >
                <div className="shrink-0 p-1 bg-red-100 rounded-full">
                  <X size={14} />
                </div>
                <p className="font-medium text-left">
                  {loginError}
                  {loginError.includes('auth/unauthorized-domain') && (
                    <span className="block mt-1 text-[10px] opacity-80">
                      (Hint: Add this domain to Authorized Domains in Firebase Console)
                    </span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={async () => {
              setLoginError(null);
              try {
                await signInWithGoogle();
              } catch (err: any) {
                setLoginError(err.message || "Login failed. Please try again.");
              }
            }}
            className="w-full flex items-center justify-center gap-3 bg-ink text-white py-4 rounded-2xl font-medium hover:bg-black transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {t.googleLogin}
          </button>
          <p className="mt-4 text-xs text-gray-400">{t.address}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-warm overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Droplets className="text-blue-600 w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Milad Water</span>
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
        
        <div className="mt-auto p-6 border-t border-gray-50 flex flex-col gap-4">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-ink font-medium transition-colors"
          >
            <Languages size={18} />
            {lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          </button>
          
          <div className="flex items-center gap-3">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-ink truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <Droplets className="text-blue-600 w-6 h-6" />
            <span className="font-bold text-lg">Milad Water</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="text-gray-400">
              <Languages size={20} />
            </button>
            <button onClick={logout} className="text-gray-400">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10">
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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-between z-40">
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
        active ? 'bg-ink text-white' : 'text-gray-500 hover:bg-gray-50'
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
      className={`p-3 rounded-2xl transition-all ${active ? 'text-blue-600 bg-blue-50 shadow-sm' : 'text-gray-400'}`}
    >
      {icon}
    </button>
  );
}


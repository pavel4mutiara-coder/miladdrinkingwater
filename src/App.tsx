import { useState, useEffect, Suspense, lazy } from 'react';
import { checkFirebaseInitialized } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './utils/locales';

// --- Sub-components & Layouts ---
import Login from './components/Login';
import Sidebar from './layouts/Sidebar';
import MobileNav from './layouts/MobileNav';
import MobileHeader from './layouts/MobileHeader';
import ConfirmModal from './components/ui/ConfirmModal';

// --- Lazy-loaded Pages ---
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VehicleManager = lazy(() => import('./pages/VehicleManager'));
const DealerManager = lazy(() => import('./pages/DealerManager'));
const ExpenseManager = lazy(() => import('./pages/ExpenseManager'));
const DriverManager = lazy(() => import('./pages/DriverManager'));
const CNGManager = lazy(() => import('./pages/CNGManager'));
const ReportsManager = lazy(() => import('./pages/ReportsManager'));

// Loading Fallback Component
const LoadingFallback = ({ darkMode, text }: { darkMode: boolean, text: string }) => (
  <div className={`flex items-center justify-center h-full min-h-[400px] ${darkMode ? 'text-white' : 'text-ink'}`}>
    <motion.div 
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
      transition={{ repeat: Infinity, duration: 2 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{text}...</span>
    </motion.div>
  </div>
);

type TabType = 'dashboard' | 'vehicles' | 'dealers' | 'expenses' | 'drivers' | 'cng' | 'reports';

export default function App() {
  // Ensure Firebase is initialized correctly
  checkFirebaseInitialized();

  const [user, setUser] = useState<{ uid: string } | null>(() => {
    try {
      return localStorage.getItem('milad_admin_session') === 'active' ? { uid: 'admin' } : null;
    } catch {
      return null;
    }
  });

  const [lang, setLang] = useState<Language>(() => {
     try {
       return (localStorage.getItem('milad_water_lang') as Language) || 'bn';
     } catch {
       return 'bn';
     }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('milad_water_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('nav-tab', handleNav);
    return () => window.removeEventListener('nav-tab', handleNav);
  }, []);

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('milad_water_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('milad_water_theme', 'light');
      }
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('milad_water_lang', lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage', e);
    }
  }, [lang]);

  const t = translations[lang];

  const handleLogout = () => {
    try {
      localStorage.removeItem('milad_admin_session');
    } catch (e) {
      console.warn('Failed to clear session from localStorage', e);
    }
    setUser(null);
    setIsLogoutModalOpen(false);
  };

  if (!user) {
    return <Login onLogin={setUser} lang={lang} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden safe-top safe-bottom select-none transition-colors duration-300 ${isDarkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-bg-warm text-ink'}`}>
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        toggleLang={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MobileHeader 
          lang={lang}
          isDarkMode={isDarkMode}
          toggleLang={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
          toggleDarkMode={() => setIsDarkMode(prev => !prev)}
          onLogout={() => setIsLogoutModalOpen(true)}
        />

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-10 pb-24 sm:pb-28 lg:pb-10 bg-bg-warm dark:bg-dark-bg transition-colors duration-300 custom-scrollbar">
          <Suspense fallback={<LoadingFallback darkMode={isDarkMode} text={t.loading} />}>
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
          </Suspense>
        </div>

        <MobileNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
        />

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

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Droplets, Plus } from 'lucide-react';
import { translations, Language } from '../utils/locales';

interface LoginProps {
  onLogin: (user: { uid: string }) => void;
  lang: Language;
  isDarkMode: boolean;
}

export default function Login({ onLogin, lang, isDarkMode }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const t = translations[lang];
  const ADMIN_USERNAME = "Admin";
  const ADMIN_PASSWORD = "Milad2006";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Simulate login delay for production feel
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        try {
          localStorage.setItem('milad_admin_session', 'active');
        } catch (e) {
          console.warn('Failed to save session to localStorage', e);
        }
        onLogin({ uid: 'admin' });
      } else {
        setLoginError(lang === 'bn' ? 'ইউজারনেম বা পাসওয়ার্ড ভুল' : 'Invalid Username or Password');
      }
      setIsLoggingIn(false);
    }, 500);
  };

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
            {isLoggingIn ? (lang === 'bn' ? 'লগইন হচ্ছে...' : 'Logging in...') : (lang === 'bn' ? 'লগইন করুন' : 'Login')}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-center text-gray-300 dark:text-dark-muted uppercase tracking-[0.2em] font-bold">{t.appName}</p>
      </motion.div>
    </div>
  );
}

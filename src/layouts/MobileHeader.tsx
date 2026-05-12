import React from 'react';
import { Droplets, LogOut, Sun, Moon } from 'lucide-react';
import { Language } from '../utils/locales';

interface MobileHeaderProps {
  toggleLang: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  lang: Language;
  onLogout: () => void;
}

export default function MobileHeader({ toggleLang, toggleDarkMode, isDarkMode, lang, onLogout }: MobileHeaderProps) {
  return (
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
        <button onClick={onLogout} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

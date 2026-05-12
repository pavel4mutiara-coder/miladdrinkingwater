import React from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  Droplets, 
  LayoutDashboard, 
  LogOut, 
  DollarSign,
  Users,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { Language, translations } from '../utils/locales';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  lang: Language;
  toggleLang: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  lang, 
  toggleLang, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout 
}: SidebarProps) {
  const t = translations[lang];

  return (
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
           <button onClick={toggleDarkMode} className="text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white transition-colors">
             {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <button onClick={toggleLang} className="text-xs font-bold text-gray-500 dark:text-dark-muted hover:text-ink dark:hover:text-white transition-colors">
             {lang.toUpperCase()}
           </button>
           <button onClick={onLogout} className="text-red-500 hover:text-red-600 transition-colors">
             <LogOut size={18} />
           </button>
        </div>
        
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-ink dark:text-white truncate">Admin</p>
            <p className="text-[10px] text-gray-400 dark:text-dark-muted truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
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

import React from 'react';
import { 
  Truck, 
  Droplets, 
  LayoutDashboard, 
  DollarSign,
  Users,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { Language, translations } from '../utils/locales';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  lang: Language;
}

export default function MobileNav({ activeTab, setActiveTab, lang }: MobileNavProps) {
  const t = translations[lang];

  return (
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
  );
}

function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 min-w-[56px] sm:min-w-[64px] rounded-2xl transition-all duration-200 ${
        active 
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
          : 'text-gray-400 dark:text-dark-muted'
      }`}
    >
      {icon}
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{label}</span>
    </button>
  );
}

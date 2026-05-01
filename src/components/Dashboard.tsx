import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Users, 
  Droplets,
  DollarSign
} from 'lucide-react';
import { translations, Language } from '../locales';

export default function Dashboard({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [stats, setStats] = useState({
    totalVehicleIncome: 0,
    totalMaintenanceCost: 0,
    totalDealerSales: 0,
    totalExpenses: 0,
    vehicleCount: 0,
    dealerCount: 0
  });

  useEffect(() => {
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snap) => {
      setStats(prev => ({ ...prev, vehicleCount: snap.size }));
    });

    const unsubDealers = onSnapshot(collection(db, 'dealers'), (snap) => {
      setStats(prev => ({ ...prev, dealerCount: snap.size }));
    });

    const unsubIncome = onSnapshot(collection(db, 'vehicle_income'), (snap) => {
      let total = 0;
      snap.forEach(doc => total += doc.data().amount || 0);
      setStats(prev => ({ ...prev, totalVehicleIncome: total }));
    });

    const unsubMaintenance = onSnapshot(collection(db, 'maintenance'), (snap) => {
      let total = 0;
      snap.forEach(doc => total += doc.data().cost || 0);
      setStats(prev => ({ ...prev, totalMaintenanceCost: total }));
    });

    const unsubSales = onSnapshot(collection(db, 'water_sales'), (snap) => {
      let total = 0;
      snap.forEach(doc => total += doc.data().totalAmount || 0);
      setStats(prev => ({ ...prev, totalDealerSales: total }));
    });

    const unsubExpenses = onSnapshot(collection(db, 'company_expenses'), (snap) => {
      let total = 0;
      snap.forEach(doc => total += doc.data().amount || 0);
      setStats(prev => ({ ...prev, totalExpenses: total }));
    });

    return () => {
      unsubVehicles();
      unsubDealers();
      unsubIncome();
      unsubMaintenance();
      unsubSales();
      unsubExpenses();
    };
  }, []);

  const vehicleNet = stats.totalVehicleIncome - stats.totalMaintenanceCost;
  const waterNet = stats.totalDealerSales - stats.totalExpenses;

  return (
    <div className="space-y-6 lg:space-y-12">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t.dashboardOverview}</h1>
        <p className="text-gray-500 mt-1">{t.allStats}</p>
      </header>

      {/* --- Vehicle Business Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Truck size={18} /></div>
           <h2 className="text-lg lg:text-xl font-bold">{t.vehicleBusiness}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <StatCard label={t.totalVehicleIncome} value={stats.totalVehicleIncome} icon={<TrendingUp className="text-emerald-500" />} color="bg-emerald-50" />
          <StatCard label={t.totalMaintenanceCost} value={stats.totalMaintenanceCost} icon={<TrendingDown className="text-rose-500" />} color="bg-rose-50" />
          <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm">
             <p className="text-gray-400 text-xs font-medium mb-1">{t.vehicleNetProfit}</p>
             <p className={`text-xl lg:text-2xl font-black ${vehicleNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ৳{vehicleNet.toLocaleString()}
             </p>
          </div>
        </div>
      </section>

      {/* --- Water Business Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600"><Droplets size={18} /></div>
           <h2 className="text-lg lg:text-xl font-bold">{t.waterBusiness}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <StatCard label={t.totalWaterSales} value={stats.totalDealerSales} icon={<TrendingUp className="text-blue-500" />} color="bg-blue-50" />
          <StatCard label={t.otherExpenses} value={stats.totalExpenses} icon={<TrendingDown className="text-orange-500" />} color="bg-orange-50" />
          <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm">
             <p className="text-gray-400 text-xs font-medium mb-1">{t.waterNetProfit}</p>
             <p className={`text-xl lg:text-2xl font-black ${waterNet >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                ৳{waterNet.toLocaleString()}
             </p>
          </div>
        </div>
      </section>
      
      {/* Location Badge */}
      <footer className="pt-6 lg:pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 opacity-50">
        <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.location}</p>
           <p className="text-xs lg:text-sm font-medium">{t.address}</p>
        </div>
        <div className="md:text-right">
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.company}</p>
           <p className="text-xs lg:text-sm font-medium">{t.appName}</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, color, isCurrency = true }: { label: string, value: number, icon: React.ReactNode, color: string, isCurrency?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100 flex items-start justify-between shadow-sm"
    >
      <div>
        <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-xl lg:text-2xl font-bold text-ink">
          {isCurrency ? '৳' : ''}{value.toLocaleString()}
        </p>
      </div>
      <div className={`p-2 lg:p-3 rounded-lg lg:rounded-2xl ${color}`}>
        {icon}
      </div>
    </motion.div>
  );
}


function ProgressBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-500">{label}</span>
        <span className="font-bold">৳{value.toLocaleString()}</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicleIncome: 0,
    totalMaintenanceCost: 0,
    totalDealerSales: 0,
    totalExpenses: 0,
    vehicleCount: 0,
    dealerCount: 0
  });

  useEffect(() => {
    // Basic real-time aggregators
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

  const totalRevenue = stats.totalVehicleIncome + stats.totalDealerSales;
  const totalOutflow = stats.totalMaintenanceCost + stats.totalExpenses;
  const netProfit = totalRevenue - totalOutflow;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">ড্যাশবোর্ড ওভারভিউ</h1>
        <p className="text-gray-500 mt-1">সব হিসাব এক নজরে</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="মোট আয় (গাড়ি + পানি)" 
          value={totalRevenue} 
          icon={<TrendingUp className="text-emerald-500" />} 
          color="bg-emerald-50"
        />
        <StatCard 
          label="মোট ব্যয় (রক্ষণাবেক্ষণ + খরচ)" 
          value={totalOutflow} 
          icon={<TrendingDown className="text-rose-500" />} 
          color="bg-rose-50"
        />
        <StatCard 
          label="মোট গাড়ি" 
          value={stats.vehicleCount} 
          isCurrency={false}
          icon={<Truck className="text-blue-500" />} 
          color="bg-blue-50"
        />
        <StatCard 
          label="মোট ডিলার" 
          value={stats.dealerCount} 
          isCurrency={false}
          icon={<Users className="text-purple-500" />} 
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="text-blue-600" />
            আর্থিক সারসংক্ষেপ
          </h2>
          
          <div className="space-y-6">
            <ProgressBar label="গাড়ির ইনকাম" value={stats.totalVehicleIncome} max={totalRevenue} color="bg-blue-500" />
            <ProgressBar label="পানির ইনকাম" value={stats.totalDealerSales} max={totalRevenue} color="bg-cyan-500" />
            <div className="pt-4 mt-6 border-t border-gray-50 flex items-center justify-between">
               <div>
                  <p className="text-gray-400 text-sm">নেট প্রফিট</p>
                  <p className={`text-4xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ৳{netProfit.toLocaleString()}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-gray-400 text-sm">মিরবক্সটুলা, সিলেট</p>
                  <p className="text-sm font-medium">মিলাদ ড্রিংকিং ওয়াটার</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-ink text-white rounded-3xl p-8 flex flex-col justify-between">
          <div>
             <Droplets className="w-12 h-12 text-blue-400 mb-6" />
             <h2 className="text-2xl font-bold mb-2">পানির ব্যবসা</h2>
             <p className="text-gray-400 text-sm">ডিলার ম্যানেজমেন্ট এবং দৈনিক বিক্রয় ট্র্যাকিং সিস্টেম।</p>
          </div>
          <div className="mt-8 space-y-4">
             <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <span className="text-sm">দৈনিক বিক্রয়</span>
                <span className="font-bold">সচল</span>
             </div>
             <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                <span className="text-sm">ডিলার নেটওয়ার্ক</span>
                <span className="font-bold">{stats.dealerCount}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isCurrency = true }: { label: string, value: number, icon: React.ReactNode, color: string, isCurrency?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start justify-between shadow-sm"
    >
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-ink">
          {isCurrency ? '৳' : ''}{value.toLocaleString()}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
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

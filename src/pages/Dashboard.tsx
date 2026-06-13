import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Users, 
  Droplets,
  DollarSign,
  Smartphone,
  BarChart2
} from 'lucide-react';
import { translations, Language } from '../utils/locales';

export default function Dashboard({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicleIncome: 0,
    totalMaintenanceCost: 0,
    totalDealerSales: 0,
    totalExpenses: 0,
    totalCngIncome: 0,
    totalCngExpense: 0,
    vehicleCount: 0,
    dealerCount: 0,
    dailyVehicleIncome: 0,
    dailyMaintenanceCost: 0,
    dailyWaterSales: 0,
    dailyOtherExpenses: 0,
    dailyCngIncome: 0,
    dailyCngExpense: 0,
    monthlyVehicleIncome: 0,
    monthlyMaintenanceCost: 0,
    monthlyWaterSales: 0,
    monthlyOtherExpenses: 0,
    monthlyCngIncome: 0,
    monthlyCngExpense: 0
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    let activeListeners = 0;
    const totalListeners = 8;
    
    const decrementLoading = () => {
      activeListeners++;
      if (activeListeners >= totalListeners) {
        setLoading(false);
      }
    };

    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snap) => {
      setStats(prev => ({ ...prev, vehicleCount: snap.size }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'vehicles');
    });

    const unsubDealers = onSnapshot(collection(db, 'dealers'), (snap) => {
      setStats(prev => ({ ...prev, dealerCount: snap.size }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'dealers');
    });

    const unsubIncome = onSnapshot(collection(db, 'vehicle_income'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        total += amount;
        if (data.date === today) dailyTotal += amount;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += amount;
      });
      setStats(prev => ({ 
        ...prev, 
        totalVehicleIncome: total, 
        dailyVehicleIncome: dailyTotal,
        monthlyVehicleIncome: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'vehicle_income');
    });

    const unsubMaintenance = onSnapshot(collection(db, 'maintenance'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const cost = data.cost || 0;
        total += cost;
        if (data.date === today) dailyTotal += cost;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += cost;
      });
      setStats(prev => ({ 
        ...prev, 
        totalMaintenanceCost: total, 
        dailyMaintenanceCost: dailyTotal,
        monthlyMaintenanceCost: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'maintenance');
    });

    const unsubSales = onSnapshot(collection(db, 'water_sales'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const amount = data.totalAmount || 0;
        total += amount;
        if (data.date === today) dailyTotal += amount;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += amount;
      });
      setStats(prev => ({ 
        ...prev, 
        totalDealerSales: total, 
        dailyWaterSales: dailyTotal,
        monthlyWaterSales: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'water_sales');
    });

    const unsubExpenses = onSnapshot(collection(db, 'company_expenses'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        total += amount;
        if (data.date === today) dailyTotal += amount;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += amount;
      });
      setStats(prev => ({ 
        ...prev, 
        totalExpenses: total, 
        dailyOtherExpenses: dailyTotal,
        monthlyOtherExpenses: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'company_expenses');
    });

    const unsubCngIncome = onSnapshot(collection(db, 'cng_income'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        total += amount;
        if (data.date === today) dailyTotal += amount;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += amount;
      });
      setStats(prev => ({ 
        ...prev, 
        totalCngIncome: total, 
        dailyCngIncome: dailyTotal,
        monthlyCngIncome: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'cng_income');
    });

    const unsubCngExpense = onSnapshot(collection(db, 'cng_expenses'), (snap) => {
      let total = 0;
      let dailyTotal = 0;
      let monthlyTotal = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        total += amount;
        if (data.date === today) dailyTotal += amount;
        if (data.date && data.date.startsWith(currentMonth)) monthlyTotal += amount;
      });
      setStats(prev => ({ 
        ...prev, 
        totalCngExpense: total, 
        dailyCngExpense: dailyTotal,
        monthlyCngExpense: monthlyTotal 
      }));
      decrementLoading();
    }, (err) => {
      decrementLoading();
      handleFirestoreError(err, OperationType.GET, 'cng_expenses');
    });

    return () => {
      unsubVehicles();
      unsubDealers();
      unsubIncome();
      unsubMaintenance();
      unsubSales();
      unsubExpenses();
      unsubCngIncome();
      unsubCngExpense();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 dark:text-dark-muted font-bold text-[10px] uppercase tracking-widest">{t.loading}...</p>
      </div>
    );
  }

  const vehicleNet = stats.totalVehicleIncome - stats.totalMaintenanceCost;
  const waterNet = stats.totalDealerSales - stats.totalExpenses;
  const cngNet = stats.totalCngIncome - stats.totalCngExpense;

  const dailyVehicleProfit = stats.dailyVehicleIncome - stats.dailyMaintenanceCost;
  const dailyWaterProfit = stats.dailyWaterSales - stats.dailyOtherExpenses;
  const dailyCngProfit = stats.dailyCngIncome - stats.dailyCngExpense;
  const totalDailyProfit = dailyVehicleProfit + dailyWaterProfit + dailyCngProfit;

  const monthlyIncome = stats.monthlyVehicleIncome + stats.monthlyWaterSales + stats.monthlyCngIncome;
  const monthlyExpenses = stats.monthlyMaintenanceCost + stats.monthlyOtherExpenses + stats.monthlyCngExpense;
  const monthlyNetProfit = monthlyIncome - monthlyExpenses;

  return (
    <div className="space-y-6 lg:space-y-10 px-1 sm:px-0">
      <header className="px-1 sm:px-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight dark:text-white">{t.dashboardOverview}</h1>
          <p className="text-gray-400 dark:text-dark-muted mt-1 text-xs sm:text-sm font-medium">{t.allStats}</p>
        </div>
        <div className="bg-blue-600 dark:bg-blue-600 px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20">
           <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">{lang === 'bn' ? 'আজকের মোট লাভ' : 'Total Daily Profit'}</p>
           <p className="text-xl font-black text-white">৳{totalDailyProfit.toLocaleString()}</p>
        </div>
      </header>

      {/* --- Daily Profit Summary Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400"><DollarSign size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">{lang === 'bn' ? 'আজকের লাভের সারাংশ' : 'Daily Profit Summary'}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{t.vehicleBusiness}</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl lg:text-3xl font-black ${dailyVehicleProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    ৳{dailyVehicleProfit.toLocaleString()}
                  </p>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500">{t.totalVehicleIncome}: ৳{stats.dailyVehicleIncome.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-rose-500">{t.totalMaintenanceCost}: ৳{stats.dailyMaintenanceCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
           </motion.div>
           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{t.waterBusiness}</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl lg:text-3xl font-black ${dailyWaterProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                    ৳{dailyWaterProfit.toLocaleString()}
                  </p>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500">{t.totalWaterSales}: ৳{stats.dailyWaterSales.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-rose-500">{t.otherExpenses}: ৳{stats.dailyOtherExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
           </motion.div>
           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 sm:col-span-2 lg:col-span-1 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{t.cng}</p>
                <div className="flex items-end justify-between">
                  <p className={`text-2xl lg:text-3xl font-black ${dailyCngProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                    ৳{dailyCngProfit.toLocaleString()}
                  </p>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500">{t.cngIncome}: ৳{stats.dailyCngIncome.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-rose-500">{t.cngExpense}: ৳{stats.dailyCngExpense.toLocaleString()}</p>
                  </div>
                </div>
              </div>
           </motion.div>
        </div>
      </section>
      
      {/* --- Monthly Quick Stats Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><BarChart2 size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">
             {lang === 'bn' ? 'চলতি মাসের সংক্ষিপ্ত চিত্র' : 'Current Month Quick Stats'}
           </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 font-mono">
                  {lang === 'bn' ? 'চলতি মাসের মোট আয়' : 'Monthly Income'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    ৳{monthlyIncome.toLocaleString()}
                  </p>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
           </motion.div>

           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 font-mono">
                  {lang === 'bn' ? 'চলতি মাসের মোট ব্যয়' : 'Monthly Expenses'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                    ৳{monthlyExpenses.toLocaleString()}
                  </p>
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                    <TrendingDown size={20} />
                  </div>
                </div>
              </div>
           </motion.div>

           <motion.div 
             whileHover={{ y: -3 }}
             className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm flex flex-col justify-between"
           >
              <div>
                <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 font-mono">
                  {lang === 'bn' ? 'চলতি মাসের নিট লাভ' : 'Monthly Net Profit'}
                </p>
                <div className="flex items-center justify-between">
                  <p className={`text-2xl lg:text-3xl font-black tracking-tight ${monthlyNetProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                    ৳{monthlyNetProfit.toLocaleString()}
                  </p>
                  <div className={`p-3 rounded-2xl shrink-0 shadow-sm ${monthlyNetProfit >= 0 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'}`}>
                    <DollarSign size={20} />
                  </div>
                </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* --- Quick Actions Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><TrendingUp size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">{t.quickActions}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <QuickActionBtn 
             onClick={() => window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'vehicles' }))}
             icon={<DollarSign size={24} />}
             label={t.addVehicleIncome}
             color="bg-emerald-600 shadow-emerald-600/20"
           />
           <QuickActionBtn 
             onClick={() => window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'vehicles' }))}
             icon={<TrendingUp size={24} />}
             label={t.addVehicleRepair}
             color="bg-rose-600 shadow-rose-600/20"
           />
           <QuickActionBtn 
             onClick={() => window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'cng' }))}
             icon={<Smartphone size={24} />}
             label={lang === 'bn' ? 'সিএনজি ইনকাম যোগ করুন' : 'Add CNG Income'}
             color="bg-blue-600 shadow-blue-600/20"
           />
           <QuickActionBtn 
             onClick={() => window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'dealers' }))}
             icon={<Droplets size={24} />}
             label={lang === 'bn' ? 'ডিলার বিক্রয় যোগ করুন' : 'Add Dealer Sale'}
             color="bg-cyan-600 shadow-cyan-600/20"
           />
        </div>
      </section>

      {/* --- Vehicle Business Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><Truck size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">{t.vehicleBusiness}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard label={t.totalVehicleIncome} value={stats.totalVehicleIncome} icon={<TrendingUp className="text-emerald-500" />} color="bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard label={t.totalMaintenanceCost} value={stats.totalMaintenanceCost} icon={<TrendingDown className="text-rose-500" />} color="bg-rose-50 dark:bg-rose-900/20" />
          <div className="bg-white dark:bg-dark-surface p-5 lg:p-7 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm sm:col-span-2 lg:col-span-1">
             <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{t.vehicleNetProfit}</p>
             <p className={`text-2xl lg:text-3xl font-black ${vehicleNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ৳{vehicleNet.toLocaleString()}
             </p>
          </div>
        </div>
      </section>

      {/* --- Water Business Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl text-cyan-600 dark:text-cyan-400"><Droplets size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">{t.waterBusiness}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard label={t.totalWaterSales} value={stats.totalDealerSales} icon={<TrendingUp className="text-blue-500" />} color="bg-blue-50 dark:bg-blue-900/20" />
          <StatCard label={t.otherExpenses} value={stats.totalExpenses} icon={<TrendingDown className="text-orange-500" />} color="bg-orange-50 dark:bg-orange-900/20" />
          <div className="bg-white dark:bg-dark-surface p-5 lg:p-7 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm sm:col-span-2 lg:col-span-1">
             <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{t.waterNetProfit}</p>
             <p className={`text-2xl lg:text-3xl font-black ${waterNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ৳{waterNet.toLocaleString()}
             </p>
          </div>
        </div>
      </section>
      
      {/* --- CNG Business Section --- */}
      <section className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"><Smartphone size={18} /></div>
           <h2 className="text-base sm:text-lg lg:text-xl font-bold dark:text-white uppercase tracking-wider">{t.cng}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard label={t.cngIncome} value={stats.totalCngIncome} icon={<TrendingUp className="text-emerald-500" />} color="bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard label={t.cngExpense} value={stats.totalCngExpense} icon={<TrendingDown className="text-rose-500" />} color="bg-rose-50 dark:bg-rose-900/20" />
          <div className="bg-white dark:bg-dark-surface p-5 lg:p-7 rounded-[32px] border border-gray-100 dark:border-dark-border shadow-sm sm:col-span-2 lg:col-span-1">
             <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{lang === 'bn' ? 'সিএনজি নিট লাভ' : 'CNG Net Profit'}</p>
             <p className={`text-2xl lg:text-3xl font-black ${cngNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                ৳{cngNet.toLocaleString()}
             </p>
          </div>
        </div>
      </section>

      {/* Location Badge */}
      <footer className="pt-6 lg:pt-8 border-t border-gray-100 dark:border-dark-border grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 dark:opacity-80">
        <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-muted mb-1">{t.location}</p>
           <p className="text-xs lg:text-sm font-medium dark:text-white">{t.address}</p>
        </div>
        <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-muted mb-1">{t.email}</p>
           <p className="text-xs lg:text-sm font-medium dark:text-white">miladdrinkingwater@gmail.com</p>
        </div>
        <div className="md:text-right">
           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-muted mb-1">{t.company}</p>
           <p className="text-xs lg:text-sm font-medium dark:text-white">{t.appName}</p>
        </div>
      </footer>
    </div>
  );
}

function QuickActionBtn({ onClick, icon, label, color }: { onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-[28px] ${color} text-white shadow-xl transition-all h-full text-left`}
    >
      <div className="p-3 bg-white/20 rounded-2xl shrink-0">
        {icon}
      </div>
      <span className="font-black text-sm lg:text-base uppercase tracking-tight leading-tight">{label}</span>
    </motion.button>
  );
}

function StatCard({ label, value, icon, color, isCurrency = true }: { label: string, value: number, icon: React.ReactNode, color: string, isCurrency?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-dark-surface p-5 lg:p-7 rounded-[32px] border border-gray-100 dark:border-dark-border flex items-start justify-between shadow-sm transition-all"
    >
      <div>
        <p className="text-gray-400 dark:text-dark-muted text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">{label}</p>
        <p className="text-2xl lg:text-3xl font-black text-ink dark:text-white tracking-tight">
          {isCurrency ? '৳' : ''}{value.toLocaleString()}
        </p>
      </div>
      <div className={`p-2.5 lg:p-4 rounded-2xl ${color} shadow-sm shrink-0`}>
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

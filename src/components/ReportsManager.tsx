import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Filter,
  BarChart2
} from 'lucide-react';
import { translations, Language } from '../locales';

export default function ReportsManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [stats, setStats] = useState({
    vehicleIncome: 0,
    maintenanceCost: 0,
    waterSales: 0,
    cngIncome: 0,
    cngExpense: 0,
    otherExpense: 0
  });

  useEffect(() => {
    // This is a simplified aggregate for the selected month
    const collections = [
      { name: 'vehicle_income', field: 'amount', stateKey: 'vehicleIncome' },
      { name: 'maintenance', field: 'cost', stateKey: 'maintenanceCost' },
      { name: 'water_sales', field: 'totalAmount', stateKey: 'waterSales' },
      { name: 'cng_income', field: 'amount', stateKey: 'cngIncome' },
      { name: 'cng_expenses', field: 'amount', stateKey: 'cngExpense' },
      { name: 'company_expenses', field: 'amount', stateKey: 'otherExpense' }
    ];

    const unsubscribes = collections.map(col => {
      const q = query(collection(db, col.name), where('date', '>=', `${selectedMonth}-01`), where('date', '<=', `${selectedMonth}-31`));
      return onSnapshot(q, (snap) => {
        let sum = 0;
        snap.forEach(d => {
          sum += d.data()[col.field] || 0;
        });
        setStats(prev => ({ ...prev, [col.stateKey]: sum }));
      }, (err) => handleFirestoreError(err, OperationType.LIST, col.name));
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [selectedMonth]);

  const totalIncome = stats.vehicleIncome + stats.waterSales + stats.cngIncome;
  const totalExpense = stats.maintenanceCost + stats.cngExpense + stats.otherExpense;
  const netProfit = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-10 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-ink dark:text-white mb-2">{t.reports}</h1>
          <p className="text-gray-500 dark:text-dark-muted font-medium">{t.allStats}</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-ink dark:bg-blue-600 text-white rounded-2xl font-bold hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
          >
            <Printer size={18} />
            {t.printReport}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-900/30"
        >
          <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{t.totalIncome}</p>
          <h2 className="text-3xl lg:text-4xl font-black text-emerald-700 dark:text-emerald-300">৳{totalIncome.toLocaleString()}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-[40px] border border-rose-100 dark:border-rose-900/30"
        >
          <div className="w-12 h-12 bg-white dark:bg-rose-800 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm mb-6">
            <TrendingDown size={24} />
          </div>
          <p className="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{t.totalExpense}</p>
          <h2 className="text-3xl lg:text-4xl font-black text-rose-700 dark:text-rose-300">৳{totalExpense.toLocaleString()}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[40px] border border-blue-100 dark:border-blue-900/30"
        >
          <div className="w-12 h-12 bg-white dark:bg-blue-800 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm mb-6">
            <DollarSign size={24} />
          </div>
          <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{t.netProfit}</p>
          <h2 className="text-3xl lg:text-4xl font-black text-blue-700 dark:text-blue-300">৳{netProfit.toLocaleString()}</h2>
        </motion.div>
      </div>

      {/* Detailed Table for Printing */}
      <div className="bg-white dark:bg-dark-surface p-8 lg:p-12 rounded-[40px] border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold flex items-center gap-3 dark:text-white">
            <BarChart2 className="text-blue-500" />
            {lang === 'bn' ? 'বিস্তারিত পরিসংখ্যান' : 'Detailed Breakdown'} ({selectedMonth})
          </h3>
          <div className="hidden print:block text-right">
             <h2 className="text-xl font-bold">Anika Transport & Milad Drinking Water</h2>
             <p className="text-xs text-gray-500">{t.address}</p>
          </div>
        </div>

        <div className="space-y-6">
          <ReportRow label={t.totalVehicleIncome} amount={stats.vehicleIncome} type="income" />
          <ReportRow label={t.totalWaterSales} amount={stats.waterSales} type="income" />
          <ReportRow label={t.cngIncome} amount={stats.cngIncome} type="income" />
          <div className="border-t border-gray-100 dark:border-dark-border my-4"></div>
          <ReportRow label={t.totalMaintenanceCost} amount={stats.maintenanceCost} type="expense" />
          <ReportRow label={t.cngExpense} amount={stats.cngExpense} type="expense" />
          <ReportRow label={t.otherExpenses} amount={stats.otherExpense} type="expense" />
          
          <div className="mt-10 p-6 bg-gray-50 dark:bg-dark-bg rounded-3xl flex justify-between items-center">
            <span className="text-lg font-black dark:text-white">{t.netProfit}</span>
            <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ৳{netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:flex justify-between mt-20 pt-10 border-t border-gray-200">
         <div className="text-center">
            <div className="w-32 border-t border-black mb-2"></div>
            <p className="text-xs font-bold">Manager Signature</p>
         </div>
         <div className="text-center">
            <div className="w-32 border-t border-black mb-2"></div>
            <p className="text-xs font-bold">Proprietor Signature</p>
         </div>
      </div>
    </div>
  );
}

function ReportRow({ label, amount, type }: { label: string, amount: number, type: 'income' | 'expense' }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-600 dark:text-dark-muted font-medium">{label}</span>
      <span className={`font-black ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {type === 'income' ? '+' : '-'} ৳{amount.toLocaleString()}
      </span>
    </div>
  );
}

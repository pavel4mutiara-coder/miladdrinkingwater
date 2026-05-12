import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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
import { translations, Language } from '../utils/locales';

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
      // Use inclusive ranges for the month; querying strings like '2023-01-01' to '2023-01-99' covers all days
      const q = query(
        collection(db, col.name), 
        where('date', '>=', `${selectedMonth}-01`), 
        where('date', '<=', `${selectedMonth}-31`)
      );
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-ink dark:text-white mb-2">{t.reports}</h1>
          <p className="text-gray-500 dark:text-dark-muted font-medium text-sm lg:text-base">{t.allStats}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" size={18} />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white text-sm"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-sm active:scale-95"
          >
            <Printer size={18} />
            {t.printReport}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-emerald-50 dark:bg-emerald-900/20 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-emerald-100 dark:border-emerald-900/30"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-emerald-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-4 lg:mb-6">
            <TrendingUp size={20} className="lg:w-6 lg:h-6" />
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">{t.totalIncome}</p>
          <h2 className="text-2xl lg:text-4xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">৳{totalIncome.toLocaleString()}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-rose-50 dark:bg-rose-900/20 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-rose-100 dark:border-rose-900/30"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-rose-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm mb-4 lg:mb-6">
            <TrendingDown size={20} className="lg:w-6 lg:h-6" />
          </div>
          <p className="text-rose-600 dark:text-rose-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">{t.totalExpense}</p>
          <h2 className="text-2xl lg:text-4xl font-black text-rose-700 dark:text-rose-300 tracking-tight">৳{totalExpense.toLocaleString()}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/20 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-blue-100 dark:border-blue-900/30 sm:col-span-2 lg:col-span-1"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-blue-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm mb-4 lg:mb-6">
            <DollarSign size={20} className="lg:w-6 lg:h-6" />
          </div>
          <p className="text-blue-600 dark:text-blue-400 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-1 lg:mb-2">{t.netProfit}</p>
          <h2 className="text-2xl lg:text-4xl font-black text-blue-700 dark:text-blue-300 tracking-tight">৳{netProfit.toLocaleString()}</h2>
        </motion.div>
      </div>

      {/* Detailed Document for Printing */}
      <div className="flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="printable-document rounded-[32px] sm:rounded-[40px] shadow-2xl p-6 sm:p-12 lg:p-16 border border-gray-100 dark:border-dark-border"
        >
          {/* Document Header */}
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 border-b border-gray-100 dark:border-dark-border pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <BarChart2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight dark:text-white uppercase">
                    {t.miladWater}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-[0.2em]">
                    {t.anikaTransport}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-muted flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  {t.address}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-2">
              <h1 className="text-3xl font-black text-ink dark:text-white uppercase tracking-tighter">
                {lang === 'bn' ? 'ব্যবসায়িক রিপোর্ট' : 'Business Report'}
              </h1>
              <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {lang === 'bn' ? 'সময়কাল' : 'Period'}: {selectedMonth}
                </p>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">
                ID: RPT-{selectedMonth.replace('-', '')}-{Math.floor(Math.random() * 9000 + 1000)}
              </p>
            </div>
          </div>

          {/* Report Content Table */}
          <div className="space-y-8">
            <div className="overflow-hidden border border-gray-100 dark:border-dark-border rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                    <th className="px-8 py-5 text-xs font-black text-gray-500 dark:text-dark-muted uppercase tracking-widest">
                      {lang === 'bn' ? 'বিবরণ' : 'Description'}
                    </th>
                    <th className="px-8 py-5 text-xs font-black text-gray-500 dark:text-dark-muted uppercase tracking-widest text-right">
                      {lang === 'bn' ? 'ধরণ' : 'Type'}
                    </th>
                    <th className="px-8 py-5 text-xs font-black text-gray-500 dark:text-dark-muted uppercase tracking-widest text-right">
                      {lang === 'bn' ? 'পরিমাণ' : 'Amount'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  <ReportTableRow label={t.totalVehicleIncome} amount={stats.vehicleIncome} type="income" lang={lang} />
                  <ReportTableRow label={t.totalWaterSales} amount={stats.waterSales} type="income" lang={lang} />
                  <ReportTableRow label={t.cngIncome} amount={stats.cngIncome} type="income" lang={lang} />
                  <ReportTableRow label={t.totalMaintenanceCost} amount={stats.maintenanceCost} type="expense" lang={lang} />
                  <ReportTableRow label={t.cngExpense} amount={stats.cngExpense} type="expense" lang={lang} />
                  <ReportTableRow label={t.otherExpenses} amount={stats.otherExpense} type="expense" lang={lang} />
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-6">
              <div className="w-full sm:w-80 space-y-4">
                <div className="flex justify-between items-center px-4">
                   <span className="text-sm font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest">{t.totalIncome}</span>
                   <span className="text-lg font-black text-emerald-600">৳{totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center px-4">
                   <span className="text-sm font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest">{t.totalExpense}</span>
                   <span className="text-lg font-black text-rose-600">৳{totalExpense.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-dark-border mx-2"></div>
                <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-dark-bg rounded-3xl border border-gray-100 dark:border-dark-border">
                   <span className="text-base font-black dark:text-white uppercase tracking-tight">{t.netProfit}</span>
                   <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                      ৳{netProfit.toLocaleString()}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="mt-24 pt-12 border-t border-gray-100 dark:border-dark-border grid grid-cols-2 gap-12">
            <div className="text-center group">
              <div className="mb-4 h-12 flex items-center justify-center">
                <div className="w-full max-w-[200px] border-b-2 border-dashed border-gray-200 dark:border-dark-border group-hover:border-blue-400 transition-colors"></div>
              </div>
              <p className="text-xs font-black text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em]">
                {lang === 'bn' ? 'ম্যানেজারের স্বাক্ষর' : 'Manager Signature'}
              </p>
            </div>
            <div className="text-center group">
              <div className="mb-4 h-12 flex items-center justify-center">
                <div className="w-full max-w-[200px] border-b-2 border-dashed border-gray-200 dark:border-dark-border group-hover:border-blue-400 transition-colors"></div>
              </div>
              <p className="text-xs font-black text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em]">
                {lang === 'bn' ? 'মালিকের স্বাক্ষর' : 'Proprietor Signature'}
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[9px] font-bold text-gray-300 dark:text-dark-muted uppercase tracking-[0.3em]">
              Generated by Milad Drinking Water Management System
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ReportTableRow({ label, amount, type, lang }: { label: string, amount: number, type: 'income' | 'expense', lang: Language }) {
  return (
    <tr className="group hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
      <td className="px-8 py-5 text-sm font-bold text-ink dark:text-white capitalize">
        {label}
      </td>
      <td className="px-8 py-5 text-right">
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
          type === 'income' 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
        }`}>
          {type === 'income' ? (lang === 'bn' ? 'আয়' : 'Income') : (lang === 'bn' ? 'ব্যয়' : 'Expense')}
        </span>
      </td>
      <td className={`px-8 py-5 text-right font-mono font-black text-sm ${
        type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
      }`}>
        {type === 'income' ? '+' : '-'} ৳{(amount || 0).toLocaleString()}
      </td>
    </tr>
  );
}

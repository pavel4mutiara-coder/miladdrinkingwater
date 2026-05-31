import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Share2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  DollarSign,
  Briefcase,
  User,
  MapPin,
  Wrench,
  Loader2
} from 'lucide-react';
import { Vehicle } from '../types';
import { translations, Language } from '../utils/locales';

interface MonthlyVehicleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  lang: Language;
  onPreparePrint: (type: 'monthly' | null) => void;
}

interface IncomeRecord {
  id: string;
  date: string;
  driverName: string;
  routeDetails: string;
  amount: number;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  mechanicName: string;
  description: string;
  sparePartsCost: number;
  cost: number;
}

export default function MonthlyVehicleReportModal({ 
  isOpen, 
  onClose, 
  vehicle, 
  lang,
  onPreparePrint
}: MonthlyVehicleReportModalProps) {
  const t = translations[lang];
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM
  });

  const [incomeList, setIncomeList] = useState<IncomeRecord[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !vehicle.id) return;

    setLoading(true);

    const startStr = `${selectedMonth}-01`;
    const endStr = `${selectedMonth}-31`; // Standard simple bounds query for month

    // Create listeners for vehicle_income
    const qIncome = query(
      collection(db, 'vehicle_income'),
      where('vehicleId', '==', vehicle.id),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubIncome = onSnapshot(qIncome, (snap) => {
      const records = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as IncomeRecord));
      records.sort((a, b) => b.date.localeCompare(a.date));
      setIncomeList(records);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vehicle_income'));

    // Create listeners for maintenance
    const qMaint = query(
      collection(db, 'maintenance'),
      where('vehicleId', '==', vehicle.id),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );

    const unsubMaint = onSnapshot(qMaint, (snap) => {
      const records = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MaintenanceRecord));
      records.sort((a, b) => b.date.localeCompare(a.date));
      setMaintenanceList(records);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'maintenance'));

    return () => {
      unsubIncome();
      unsubMaint();
    };
  }, [isOpen, vehicle.id, selectedMonth]);

  const totalIncome = incomeList.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpense = maintenanceList.reduce((sum, item) => sum + (item.cost || 0), 0);
  const netEarnings = totalIncome - totalExpense;

  // Formatting helper for date in WhatsApp/UI
  const getMonthNameBengali = (monthStr: string) => {
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const month = parts[1];
    const months: Record<string, string> = {
      '01': 'জানুয়ারি', '02': 'ফেব্রুয়ারি', '03': 'মার্চ', '04': 'এপ্রিল',
      '05': 'মে', '06': 'জুন', '07': 'জুলাই', '08': 'আগস্ট',
      '09': 'সেপ্টেম্বর', '10': 'অক্টোবর', '11': 'নভেম্বর', '12': 'ডিসেম্বর'
    };
    return `${months[month]} ${year}`;
  };

  const getMonthNameEnglish = (monthStr: string) => {
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const month = parts[1];
    const months: Record<string, string> = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    return `${months[month]} ${year}`;
  };

  const formattedMonth = lang === 'bn' ? getMonthNameBengali(selectedMonth) : getMonthNameEnglish(selectedMonth);

  // WhatsApp Share Trigger
  const handleWhatsAppShare = () => {
    const companyLabel = lang === 'bn' ? 'মিলাদ ড্রিংকিং ওয়াটার (আনিকা ট্রান্সপোর্ট)' : 'Milad Drinking Water (Anika Transport)';
    const header = lang === 'bn' ? '🚗 *যানবাহনের মাসিক আয়-ব্যয় রিপোর্ট*' : '🚗 *Vehicles Monthly Income/Expense Statement*';
    const periodLabel = lang === 'bn' ? `📅 *সময়কাল:* ${formattedMonth}` : `📅 *Period:* ${formattedMonth}`;
    const descLabel = lang === 'bn' ? `🚍 *গাড়ির নাম্বার:* ${vehicle.vehicleNumber} (${vehicle.name})` : `🚍 *Vehicle Number:* ${vehicle.vehicleNumber} (${vehicle.name})`;
    
    // Summary
    const sumTitle = lang === 'bn' ? '*আর্থিক সারসংক্ষেপ:*' : '*Financial Summary:*';
    const incLabel = lang === 'bn' ? `- মোট আয় (Total Income): ৳${totalIncome.toLocaleString()}` : `- Total Income: ৳${totalIncome.toLocaleString()}`;
    const expLabel = lang === 'bn' ? `- মোট ব্যয় (Total Expense): ৳${totalExpense.toLocaleString()}` : `- Total Expense: ৳${totalExpense.toLocaleString()}`;
    const netLabel = lang === 'bn' ? `💰 *নিট লাভ (Net Profit):* ৳${netEarnings.toLocaleString()}` : `💰 *Net Profit:* ৳${netEarnings.toLocaleString()}`;
    const footerLabel = lang === 'bn' ? '*মিলাদ ড্রিংকিং ওয়াটার অটো-জেনারেটেড রিপোর্ট*' : '*System Generated Report - Milad Drilling Water*';

    const whatsappText = `
${header}
-------------------------------------
🏢 *${companyLabel}*
${descLabel}
${periodLabel}
-------------------------------------
${sumTitle}
${incLabel}
${expLabel}
-------------------------------------
${netLabel}
-------------------------------------
_${footerLabel}_
`.trim();

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank');
  };

  // Printing Trigger
  const handlePrint = () => {
    onPreparePrint('monthly');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* UI Screen Overlay Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm print:hidden">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-dark-surface rounded-[32px] sm:rounded-[40px] max-w-4xl w-full h-[90vh]- max-h-[92vh] shadow-2xl relative border border-gray-100 dark:border-dark-border flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-bg/20">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                {lang === 'bn' ? 'যানবাহন রিপোর্ট জেনারেটর' : 'Vehicle Report Generator'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black dark:text-white capitalize">
                {vehicle.vehicleNumber} - {lang === 'bn' ? 'মাসিক আয়-ব্যয় বিবরণী' : 'Monthly Statement'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-ink dark:hover:text-white bg-gray-100 dark:bg-dark-bg p-2 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Configuration Controls */}
          <div className="p-6 border-b border-gray-100 dark:border-dark-border grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-blue-50/10 dark:bg-blue-900/5">
            <div className="flex items-center gap-3 col-span-1 sm:col-span-2">
              <Calendar className="text-blue-500 shrink-0" size={18} />
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  {lang === 'bn' ? 'মাস নির্বাচন করুন' : 'Select Statements Month'}
                </label>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl px-3 py-2 text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Print & Share Actions */}
            <div className="flex gap-2 w-full justify-end sm:col-span-1">
              <button 
                onClick={handleWhatsAppShare}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/10"
              >
                <Share2 size={14} />
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
              </button>
              <button 
                disabled={loading}
                onClick={handlePrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md shadow-blue-500/10 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                {lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}
              </button>
            </div>
          </div>

          {/* Scrollable Document Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 dark:bg-dark-bg/30 custom-scrollbar space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                <p className="text-sm font-bold">{t.loading}</p>
              </div>
            ) : (
              <>
                {/* Visual Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        {lang === 'bn' ? 'সর্বমোট আয়' : 'Total Income'}
                      </p>
                      <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                        ৳{totalIncome.toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100/50 dark:border-rose-900/30 flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                        {lang === 'bn' ? 'সর্বমোট মেরামত ব্যয়' : 'Total Repair Bill'}
                      </p>
                      <h4 className="text-xl font-black text-rose-700 dark:text-rose-300">
                        ৳{totalExpense.toLocaleString()}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        {lang === 'bn' ? 'নিট লাভ (মাসিক)' : 'Net Profit (Monthly)'}
                      </p>
                      <h4 className={`text-xl font-black ${netEarnings >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-rose-700'}`}>
                        ৳{netEarnings.toLocaleString()}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Ledger Sheets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Income Ledger */}
                  <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/20">
                      <h3 className="font-black text-xs uppercase tracking-wider dark:text-white text-emerald-600 flex items-center gap-2">
                        <TrendingUp size={14} />
                        {lang === 'bn' ? 'আয়ের বিবরণী' : 'Income Statement'} ({incomeList.length})
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar flex-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#f8fafc]/50 dark:bg-dark-bg/50">
                          <tr>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted">{t.date}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted">{t.driverName}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted">{t.route}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted text-right">{t.amount}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                          {incomeList.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/20">
                              <td className="p-3 font-bold text-gray-600 dark:text-dark-muted">{item.date}</td>
                              <td className="p-3 font-bold text-ink dark:text-dark-text">{item.driverName}</td>
                              <td className="p-3 font-medium text-gray-400 truncate max-w-[100px]">{item.routeDetails || 'N/A'}</td>
                              <td className="p-3 font-black text-right text-emerald-600">৳{item.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                          {incomeList.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 italic font-medium">
                                {lang === 'bn' ? 'এই মাসে আয়ের কোনো বিবরণ পাওয়া যায়নি' : 'No income records found for this month'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Monthly Maintenance Ledger */}
                  <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/20">
                      <h3 className="font-black text-xs uppercase tracking-wider dark:text-white text-rose-600 flex items-center gap-2">
                        <Wrench size={14} />
                        {lang === 'bn' ? 'রক্ষণাবেক্ষণ ও মেরামতের বিবরণী' : 'Repair & Maintenance Statement'} ({maintenanceList.length})
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar flex-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#f8fafc]/50 dark:bg-dark-bg/50">
                          <tr>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted">{t.date}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted text-right">{lang === 'bn' ? 'পার্টস ব্যয়' : 'Parts Cost'}</th>
                            <th className="p-3 font-bold text-gray-500 dark:text-dark-muted text-right">{t.total}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                          {maintenanceList.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/20">
                              <td className="p-3 font-bold text-gray-600 dark:text-dark-muted">{item.date}</td>
                              <td className="p-3 font-bold text-ink dark:text-dark-text truncate max-w-[120px]">{item.description}</td>
                              <td className="p-3 font-bold text-right text-gray-600 dark:text-dark-muted">৳{(item.sparePartsCost || 0).toLocaleString()}</td>
                              <td className="p-3 font-black text-right text-rose-600">৳{item.cost.toLocaleString()}</td>
                            </tr>
                          ))}
                          {maintenanceList.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-400 italic font-medium">
                                {lang === 'bn' ? 'এই মাসে মেরামতের কোনো বিবরণ পাওয়া যায়নি' : 'No maintenance records found for this month'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Bottom stats summary */}
          <div className="p-6 border-t border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-bg/20 shrink-0">
             <span className="text-xs font-bold text-gray-500">{lang === 'bn' ? '*মোট আই-ব্যয়ের খতিয়ান জেনারেটর' : '*Total Monthly Statement Generator'}</span>
             <button 
               onClick={onClose}
               className="px-6 py-2 bg-ink text-white dark:bg-dark-border hover:bg-slate-800 dark:hover:bg-slate-800 rounded-xl font-bold text-xs"
             >
               {t.close}
             </button>
          </div>
        </motion.div>
      </div>

      {/* PRINT-ONLY EMBED - Hidden in normal app usage, styled exactly for A4 A-grade papers */}
      <div className="hidden print:block fixed inset-0 z-[10000] bg-white w-full h-full p-0 m-0">
        <div className="printable-document px-12 py-16 dark:text-black">
          {/* Report Top Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-10">
            <div>
              <h2 className="text-3xl font-black uppercase text-blue-600 tracking-tight">{t.miladWater}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.anikaTransport}</p>
              <p className="text-xs mt-2 text-gray-500 font-medium">{t.address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-1 select-none">
                {lang === 'bn' ? 'যানবাহনের মাসিক রিপোর্ট' : 'Monthly Vehicle Statement'}
              </h1>
              <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl inline-block">
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest">
                  {lang === 'bn' ? 'রিপোর্ট মাস' : 'Statement Period'}: {formattedMonth}
                </p>
              </div>
              <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                ID: RPT-VEH-{vehicle.vehicleNumber.replace(/\s+/g, '')}-{selectedMonth.replace('-', '')}
              </p>
            </div>
          </div>

          {/* Vehicle Metadata Description */}
          <div className="mb-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.vehicleNumber}</p>
              <h3 className="text-3xl font-black text-ink">{vehicle.vehicleNumber}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">{vehicle.name} • {vehicle.type}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.regNumber}</p>
              <p className="text-sm font-black text-slate-800">{vehicle.registrationNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Core Table Layout for Printing */}
          <div className="space-y-10">
            
            {/* Income Sheet Table */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-600 mb-3 border-l-4 border-emerald-500 pl-2">
                {lang === 'bn' ? '১. আয়ের খতিয়ান' : '1. Monthly Income Breakdown'}
              </h3>
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-3 font-bold text-gray-700">{t.date}</th>
                    <th className="p-3 font-bold text-gray-700">{t.driverName}</th>
                    <th className="p-3 font-bold text-gray-700">{t.route}</th>
                    <th className="p-3 font-bold text-gray-700 text-right">{t.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incomeList.map(item => (
                    <tr key={item.id}>
                      <td className="p-2.5 text-gray-600 font-bold">{item.date}</td>
                      <td className="p-2.5 font-bold">{item.driverName}</td>
                      <td className="p-2.5 text-gray-500">{item.routeDetails || 'N/A'}</td>
                      <td className="p-2.5 font-black text-right text-emerald-600">৳{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {incomeList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400 italic bg-white">
                        {lang === 'bn' ? 'এই মাসে কোনো আয়ের রেকর্ড নেই।' : 'No income records found for this period.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Expense Sheet Table */}
            <div className="break-inside-avoid">
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-600 mb-3 border-l-4 border-rose-500 pl-2">
                {lang === 'bn' ? '২. মেরামতের খতিয়ান' : '2. Maintenance & Repair Breakdown'}
              </h3>
              <table className="w-full text-left text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-3 font-bold text-gray-700">{t.date}</th>
                    <th className="p-3 font-bold text-gray-700">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                    <th className="p-3 font-bold text-gray-700">{t.mechanic}</th>
                    <th className="p-3 font-bold text-gray-700 text-right">{lang === 'bn' ? 'খুচরা যন্ত্রাংশ' : 'Parts Cost'}</th>
                    <th className="p-3 font-bold text-gray-700 text-right">{t.total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {maintenanceList.map(item => (
                    <tr key={item.id}>
                      <td className="p-2.5 text-gray-600 font-bold">{item.date}</td>
                      <td className="p-2.5 font-bold">{item.description}</td>
                      <td className="p-2.5 text-gray-600">{item.mechanicName || 'N/A'}</td>
                      <td className="p-2.5 text-right font-semibold text-gray-600">৳{(item.sparePartsCost || 0).toLocaleString()}</td>
                      <td className="p-2.5 font-black text-right text-rose-600">৳{item.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                  {maintenanceList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 italic bg-white">
                        {lang === 'bn' ? 'এই মাসে মেরামতের কোনো রেকর্ড নেই।' : 'No maintenance records found for this period.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal Financial Calculation */}
            <div className="flex justify-end pt-6 break-inside-avoid">
              <div className="w-80 space-y-2.5 border border-gray-250 p-6 rounded-[24px]">
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold text-gray-500 uppercase tracking-widest">{t.totalIncome}</span>
                   <span className="font-black text-emerald-600">৳{totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold text-gray-500 uppercase tracking-widest">{t.totalMaintenance}</span>
                   <span className="font-black text-rose-600">৳{totalExpense.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center pt-2">
                   <span className="text-sm font-black uppercase tracking-tight">{t.netProfit}</span>
                   <span className={`text-xl font-black ${netEarnings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      ৳{netEarnings.toLocaleString()}
                   </span>
                </div>
              </div>
            </div>

            {/* Print Signature Footer block */}
            <div className="mt-20 pt-10 border-t border-gray-200 grid grid-cols-2 gap-12 break-inside-avoid">
              <div className="text-center">
                <div className="mb-3 h-10 flex items-end justify-center">
                  <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-350"></div>
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {lang === 'bn' ? 'ম্যানেজারের স্বাক্ষর' : 'Manager Signature'}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-3 h-10 flex items-end justify-center">
                  <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-350"></div>
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {lang === 'bn' ? 'মালিকের স্বাক্ষর' : 'Proprietor Signature'}
                </p>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-gray-150- select-none">
              <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                Report Auto Generated - Milad Drinking Water (Anika Transport) Sylhet
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  History,
  Fuel,
  Settings as SettingsIcon,
  User as UserIcon,
  Smartphone,
  ChevronRight,
  Printer,
  Calendar
} from 'lucide-react';
import { CNG, CNGIncome, CNGExpense, Driver } from '../types';
import { translations, Language } from '../locales';
import ConfirmModal from './ui/ConfirmModal';

interface CNGManagerProps {
  lang: Language;
}

export default function CNGManager({ lang }: CNGManagerProps) {
  const [cngs, setCngs] = useState<CNG[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incomes, setIncomes] = useState<CNGIncome[]>([]);
  const [expenses, setExpenses] = useState<CNGExpense[]>([]);
  
  const [selectedCng, setSelectedCng] = useState<CNG | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null; type: 'cng' | 'income' | 'expense' }>({ isOpen: false, id: null, type: 'cng' });
  const t = translations[lang];

  const [form, setForm] = useState({
    cngNumber: '',
    driverId: '',
    dailyPayment: 0,
    dueAmount: 0
  });

  const [incomeForm, setIncomeForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], type: 'Gas', description: '' });

  useEffect(() => {
    const qCng = query(collection(db, 'cng_rickshaws'), orderBy('createdAt', 'desc'));
    const qDrivers = query(collection(db, 'drivers'), orderBy('name', 'asc'));
    
    const unsubCng = onSnapshot(qCng, (snapshot) => {
      setCngs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as CNG)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cng_rickshaws'));

    const unsubDrivers = onSnapshot(qDrivers, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'drivers'));

    return () => {
      unsubCng();
      unsubDrivers();
    };
  }, []);

  useEffect(() => {
    if (!selectedCng) return;

    const qInc = query(collection(db, 'cng_income'), where('cngId', '==', selectedCng.id));
    const qExp = query(collection(db, 'cng_expenses'), where('cngId', '==', selectedCng.id));

    const unsubInc = onSnapshot(qInc, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as CNGIncome));
      // Sort in-memory to avoid index requirement
      data.sort((a, b) => b.date.localeCompare(a.date));
      setIncomes(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cng_income'));

    const unsubExp = onSnapshot(qExp, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as CNGExpense));
      // Sort in-memory to avoid index requirement
      data.sort((a, b) => b.date.localeCompare(a.date));
      setExpenses(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'cng_expenses'));

    return () => {
      unsubInc();
      unsubExp();
    };
  }, [selectedCng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !form.cngNumber || !form.driverId) {
      if (!form.cngNumber || !form.driverId) alert(lang === 'bn' ? 'নম্বর এবং ড্রাইভার প্রয়োজন' : 'Number and Driver required');
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'cng_rickshaws'), {
        ...form,
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
      setForm({ cngNumber: '', driverId: '', dailyPayment: 0, dueAmount: 0 });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cng_rickshaws');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCng || isSaving) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'cng_income'), {
        cngId: selectedCng.id,
        ...incomeForm,
        createdAt: Timestamp.now()
      });
      setIncomeForm({ amount: 0, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cng_income');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCng || isSaving) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'cng_expenses'), {
        cngId: selectedCng.id,
        ...expenseForm,
        createdAt: Timestamp.now()
      });
      setExpenseForm({ amount: 0, date: new Date().toISOString().split('T')[0], type: 'Gas', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cng_expenses');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCNG = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cng_rickshaws', id));
      if (selectedCng?.id === id) setSelectedCng(null);
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete CNG rickshaw.');
      handleFirestoreError(err, OperationType.DELETE, 'cng_rickshaws');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cng_income', id));
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete income.');
      handleFirestoreError(err, OperationType.DELETE, 'cng_income');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cng_expenses', id));
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete expense.');
      handleFirestoreError(err, OperationType.DELETE, 'cng_expenses');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
      {/* Sidebar List */}
      <div className={`w-full lg:w-80 flex flex-col gap-6 ${selectedCng ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t.cng}</h2>
          <button onClick={() => setIsAdding(true)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* Mobile Horizontal Selector when a CNG is selected */}
        {selectedCng && (
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {cngs.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCng(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  selectedCng.id === c.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-dark-surface text-gray-500 dark:text-dark-muted border-gray-100 dark:border-dark-border'
                }`}
              >
                {c.cngNumber}
              </button>
            ))}
          </div>
        )}

        <div className={`flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar ${selectedCng ? 'hidden lg:block' : 'block'}`}>
          {cngs.map(cng => (
            <div
              key={cng.id}
              className="relative group"
            >
              <button
                onClick={() => setSelectedCng(cng)}
                className={`w-full text-left p-5 rounded-[32px] border transition-all ${
                  selectedCng?.id === cng.id 
                    ? 'bg-ink dark:bg-blue-600 border-ink dark:border-blue-500 text-white shadow-xl shadow-blue-600/10' 
                    : 'bg-white dark:bg-dark-surface border-gray-50 dark:border-dark-border text-ink dark:text-white hover:bg-gray-50 dark:hover:bg-dark-bg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedCng?.id === cng.id ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                    <Smartphone className={selectedCng?.id === cng.id ? 'text-white' : 'text-blue-600 dark:text-blue-400'} size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg">{cng.cngNumber}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedCng?.id === cng.id ? 'text-blue-200' : 'text-gray-400 dark:text-dark-muted'}`}>
                      {drivers.find(d => d.id === cng.driverId)?.name || 'NO DRIVER'}
                    </p>
                  </div>
                </div>
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: cng.id, type: 'cng' }); }}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                  selectedCng?.id === cng.id 
                    ? 'text-white/40 hover:text-white hover:bg-white/10' 
                    : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Details Area */}
      <div className={`flex-1 ${!selectedCng ? 'hidden lg:flex' : 'flex flex-col'}`}>
        <AnimatePresence mode="wait">
          {selectedCng ? (
            <motion.div
              key={selectedCng.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Printable CNG Report (Hidden in UI, Visible in Print) */}
              <div className="hidden print:block fixed inset-0 z-[9999] bg-white w-full h-full p-0 m-0">
                <div className="printable-document px-12 py-16">
                  <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-10">
                    <div>
                      <h2 className="text-2xl font-black uppercase text-blue-600">{t.miladWater}</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.anikaTransport}</p>
                      <p className="text-xs mt-2 text-gray-500">{t.address}</p>
                    </div>
                    <div className="text-right">
                      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{lang === 'bn' ? 'সিএনজি রিপোর্ট' : 'CNG Rickshaw Report'}</h1>
                      <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 inline-block">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                          {lang === 'bn' ? 'তারিখ' : 'Date'}: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-10 grid grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.cngNumber}</p>
                      <h3 className="text-2xl font-black text-ink">{selectedCng.cngNumber}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-2">{lang === 'bn' ? 'ড্রাইভার' : 'Driver'}: {drivers.find(d => d.id === selectedCng.driverId)?.name}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 grid grid-cols-2 gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.dailyPayment}</p>
                        <p className="text-xl font-black text-ink">৳{selectedCng.dailyPayment.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">{t.dueAmount}</p>
                        <p className="text-xl font-black text-red-600">৳{selectedCng.dueAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {/* Income Table */}
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        {t.cngIncome}
                      </h3>
                      <table className="w-full text-left border-collapse border border-gray-100 rounded-2xl overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.date}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.description}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t.amount}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {incomes.map(inc => (
                            <tr key={inc.id} className="text-xs font-bold">
                              <td className="px-6 py-3 text-gray-500">{inc.date}</td>
                              <td className="px-6 py-3">Daily Rent Received</td>
                              <td className="px-6 py-3 text-right text-emerald-600 font-black">৳{inc.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Expense Table */}
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-rose-500" />
                        {t.cngExpense}
                      </h3>
                      <table className="w-full text-left border-collapse border border-gray-100 rounded-2xl overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.date}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.category}</th>
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t.amount}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {expenses.map(exp => (
                            <tr key={exp.id} className="text-xs font-bold">
                              <td className="px-6 py-3 text-gray-500">{exp.date}</td>
                              <td className="px-6 py-3">{exp.type}</td>
                              <td className="px-6 py-3 text-right text-rose-600 font-black">৳{exp.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 gap-12">
                    <div className="text-center">
                      <div className="mb-4 h-12 flex items-center justify-center">
                        <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-200"></div>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver Signature</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-4 h-12 flex items-center justify-center">
                        <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-200"></div>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-gray-50 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                 <div className="flex items-center gap-4 sm:gap-6 text-ink dark:text-white">
                  <button 
                    onClick={() => setSelectedCng(null)}
                    className="lg:hidden p-2 text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg rounded-xl"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-[22px] flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                    <TrendingUp className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-black truncate">{selectedCng.cngNumber}</h1>
                     <div className="flex items-center gap-2 text-gray-400 dark:text-dark-muted text-[10px] sm:text-sm font-bold truncate">
                        <UserIcon size={12} className="sm:w-[14px] sm:h-[14px]" /> {drivers.find(d => d.id === selectedCng.driverId)?.name}
                     </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                  <div className="flex gap-4">
                    <div className="flex-1 sm:text-right">
                      <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{t.dailyPayment}</p>
                      <p className="text-lg sm:text-2xl font-black text-ink dark:text-white font-mono">৳{selectedCng.dailyPayment.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 sm:h-10 bg-gray-100 dark:bg-dark-border mx-1 sm:mx-2 self-center" />
                    <div className="flex-1 text-right">
                      <p className="text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{t.dueAmount}</p>
                      <p className="text-lg sm:text-2xl font-black text-red-500 font-mono">৳{selectedCng.dueAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl border border-gray-100 dark:border-dark-border transition-all transition-colors active:scale-95"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Income Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-lg dark:text-white flex items-center gap-2">
                       <DollarSign className="text-green-500" size={20} /> {t.cngIncome}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-dark-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-50 dark:border-dark-border">
                    <form onSubmit={handleAddIncome} className="flex gap-2 sm:gap-3 mb-5">
                       <input 
                         type="date"
                         value={incomeForm.date}
                         onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                         className="flex-1 bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 outline-none focus:ring-2 focus:ring-green-500/20 text-xs sm:text-sm dark:text-white"
                       />
                       <input 
                         type="number"
                         placeholder="Amount"
                         value={incomeForm.amount || ''}
                         onChange={(e) => setIncomeForm({...incomeForm, amount: Number(e.target.value)})}
                         className="flex-1 bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 outline-none focus:ring-2 focus:ring-green-500/20 text-xs sm:text-sm dark:text-white"
                       />
                       <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-3 sm:px-4 rounded-xl hover:bg-green-700 transition-all shrink-0">
                         <Plus size={18} />
                       </button>
                    </form>

                    <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                      {incomes.map(inc => (
                        <div key={inc.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-dark-bg rounded-xl sm:rounded-2xl group transition-all">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-dark-muted">{inc.date}</p>
                            <p className="text-xs sm:text-sm font-bold dark:text-white shrink-0 truncate max-w-[120px] sm:max-w-none">Daily Payment Received</p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="font-black text-green-600 text-xs sm:text-base">+ ৳{inc.amount}</span>
                            <button 
                              type="button"
                              onClick={() => setConfirmModal({ isOpen: true, id: inc.id, type: 'income' })} 
                              className="opacity-0 lg:group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expense Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-lg dark:text-white flex items-center gap-2">
                       <TrendingUp className="text-red-500" size={20} /> {t.cngExpense}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-dark-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-50 dark:border-dark-border">
                    <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                       <input 
                         type="date"
                         value={expenseForm.date}
                         onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                         className="col-span-1 bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 outline-none focus:ring-2 focus:ring-red-500/20 text-xs sm:text-sm dark:text-white"
                       />
                       <select 
                         value={expenseForm.type}
                         onChange={(e) => setExpenseForm({...expenseForm, type: e.target.value as any})}
                         className="col-span-1 bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 outline-none focus:ring-2 focus:ring-red-500/20 text-xs sm:text-sm dark:text-white"
                       >
                         <option value="Gas">Gas</option>
                         <option value="Repair">Repair</option>
                         <option value="Tire">Tire</option>
                         <option value="Battery">Battery</option>
                         <option value="Engine">Engine</option>
                         <option value="Other">Other</option>
                       </select>
                       <input 
                         type="number"
                         placeholder="Amount"
                         value={expenseForm.amount || ''}
                         onChange={(e) => setExpenseForm({...expenseForm, amount: Number(e.target.value)})}
                         className="col-span-1 bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2 px-3 sm:py-2.5 sm:px-4 outline-none focus:ring-2 focus:ring-red-500/20 text-xs sm:text-sm dark:text-white"
                       />
                       <button type="submit" disabled={isSaving} className="col-span-1 bg-red-600 text-white py-2 px-3 sm:py-2.5 rounded-xl hover:bg-red-700 transition-all font-bold flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                         <Plus size={14} className="sm:w-4 sm:h-4" /> {t.save}
                       </button>
                    </form>

                    <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                       {expenses.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-dark-bg rounded-xl sm:rounded-2xl group transition-all">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-dark-surface rounded-lg sm:rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                <Fuel size={16} className="sm:w-5 sm:h-5" />
                             </div>
                             <div className="truncate">
                              <p className="text-[10px] font-black text-gray-400 dark:text-dark-muted">{exp.date}</p>
                              <p className="text-xs sm:text-sm font-bold dark:text-white truncate">{exp.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            <span className="font-black text-red-500 text-xs sm:text-base">- ৳{exp.amount}</span>
                            <button 
                              type="button"
                              onClick={() => setConfirmModal({ isOpen: true, id: exp.id, type: 'expense' })} 
                              className="opacity-0 lg:group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-20">
              <div className="max-w-xs space-y-4">
                 <div className="w-24 h-24 bg-gray-100 dark:bg-dark-surface rounded-[40px] flex items-center justify-center mx-auto">
                    <Smartphone className="text-gray-300 dark:text-dark-muted" size={48} />
                 </div>
                 <h3 className="text-xl font-black dark:text-white">{t.selectVehicle}</h3>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add CNG Modal */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          if (!confirmModal.id) return;
          if (confirmModal.type === 'cng') handleDeleteCNG(confirmModal.id);
          else if (confirmModal.type === 'income') handleDeleteIncome(confirmModal.id);
          else if (confirmModal.type === 'expense') handleDeleteExpense(confirmModal.id);
        }}
        title={t.confirmDelete}
        message={
          confirmModal.type === 'cng' 
            ? (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই সিএনজিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this CNG rickshaw?')
            : confirmModal.type === 'income'
            ? (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই আয়ের তথ্য মুছে ফেলতে চান?' : 'Are you sure you want to delete this income record?')
            : (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই খরচের তথ্য মুছে ফেলতে চান?' : 'Are you sure you want to delete this expense record?')
        }
        confirmText={t.delete}
        cancelText={t.close}
      />

      {isAdding && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-surface w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
          >
             <div className="p-6 border-b border-gray-50 dark:border-dark-border flex items-center justify-between">
              <h3 className="text-xl font-black dark:text-white">{t.addCNG}</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.cngNumber}</label>
                  <input 
                    required
                    type="text"
                    placeholder="SYL-XXX"
                    value={form.cngNumber}
                    onChange={(e) => setForm({...form, cngNumber: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{lang === 'bn' ? 'ড্রাইভার নির্বাচন করুন' : 'Select Driver'}</label>
                  <select 
                    required
                    value={form.driverId}
                    onChange={(e) => setForm({...form, driverId: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  >
                     <option value="">Choose Driver</option>
                     {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.dailyPayment}</label>
                    <input 
                      required
                      type="number"
                      value={form.dailyPayment || ''}
                      onChange={(e) => setForm({...form, dailyPayment: Number(e.target.value)})}
                      className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.dueAmount}</label>
                    <input 
                      type="number"
                      value={form.dueAmount || ''}
                      onChange={(e) => setForm({...form, dueAmount: Number(e.target.value)})}
                      className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                    />
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3.5 bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-dark-muted font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                >
                  {t.close}
                </button>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  {isSaving ? t.loading : <><Save size={18} /> {t.save}</>}
                </button>
              </div>
            </form>
          </motion.div>
         </div>
      )}
    </div>
  );
}

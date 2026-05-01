import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  FileText,
  TrendingDown,
  X,
  ChevronDown
} from 'lucide-react';
import { CompanyExpense } from '../types';

const CATEGORIES = [
  'অফিস ভাড়া',
  'বিদ্যুৎ বিল',
  'গ্যাস বিল',
  'কর্মচারীর বেতন',
  'রাস্তা খরচ',
  'অন্যান্য'
];

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    category: CATEGORIES[0], 
    description: '', 
    amount: 0 
  });

  useEffect(() => {
    const q = query(collection(db, 'company_expenses'), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyExpense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'company_expenses'));
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'company_expenses'), {
        ...newExpense,
        amount: Number(newExpense.amount),
        createdAt: serverTimestamp()
      });
      setNewExpense({ ...newExpense, description: '', amount: 0 });
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'company_expenses');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ডিলিট করতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'company_expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'company_expenses');
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">কোম্পানির অন্যান্য খরচ</h1>
          <p className="text-gray-500 mt-1">অফিস এবং সাধারণ পরিচালনা ব্যয়</p>
        </div>
        <div className="bg-rose-50 px-6 py-4 rounded-3xl border border-rose-100 flex items-center gap-4">
           <div className="p-3 bg-rose-500 rounded-2xl text-white">
              <TrendingDown size={24} />
           </div>
           <div>
              <p className="text-rose-600 text-xs font-bold uppercase tracking-wider">মোট খরচ</p>
              <p className="text-2xl font-black text-rose-700">৳{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="text-rose-500" />
            খরচ রেকর্ড করুন
          </h2>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className={`p-3 rounded-2xl transition-all ${showAdd ? 'bg-ink text-white rotate-45' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            <Plus size={24} />
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-50 bg-gray-50/50"
            >
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">তারিখ</label>
                      <input 
                        type="date" 
                        required 
                        value={newExpense.date} 
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ক্যাটেগরি</label>
                      <select 
                        value={newExpense.category} 
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">টাকার পরিমাণ (৳)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        value={newExpense.amount || ''} 
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-lg" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">বিবরণ</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="খরচের বিবরণ লিখুন..." 
                        value={newExpense.description} 
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl" 
                      />
                   </div>
                </div>
                <div className="md:col-span-2 pt-2">
                   <button className="w-full py-4 bg-ink text-white rounded-2xl font-bold hover:bg-black transition-all">খরচ সেভ করুন</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">তারিখ</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ক্যাটেগরি</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">বিবরণ</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">পরিমাণ (৳)</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(exp => (
                <tr key={exp.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-medium">{exp.date}</td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-full text-gray-600">{exp.category}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">{exp.description}</td>
                  <td className="px-8 py-5 text-right font-black text-ink">৳{exp.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic">
               কোন খরচের রেকর্ড খুঁজে পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

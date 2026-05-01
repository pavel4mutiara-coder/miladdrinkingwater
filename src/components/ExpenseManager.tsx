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
import { CompanyExpense, ExpenseCategory } from '../types';
import { translations, Language } from '../locales';

export default function ExpenseManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    category: '', 
    description: '', 
    amount: 0 
  });

  useEffect(() => {
    const q = query(collection(db, 'company_expenses'), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
    const unsubscribeExpenses = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyExpense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'company_expenses'));

    const qCat = query(collection(db, 'expense_categories'), orderBy('name', 'asc'));
    const unsubscribeCats = onSnapshot(qCat, (snap) => {
      const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseCategory));
      setCategories(cats);
      if (cats.length > 0 && !newExpense.category) {
        setNewExpense(prev => ({ ...prev, category: cats[0].name }));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expense_categories'));

    return () => {
      unsubscribeExpenses();
      unsubscribeCats();
    };
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
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'company_expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'company_expenses');
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t.companyExpenses}</h1>
          <p className="text-gray-500 text-sm lg:text-base mt-1">{lang === 'bn' ? 'অফিস এবং সাধারণ পরিচালনা ব্যয়' : 'Office and general operational expenses'}</p>
        </div>
        <div className="bg-rose-50 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-3xl border border-rose-100 flex items-center gap-4 animate-in fade-in slide-in-from-right duration-500">
           <div className="p-2 lg:p-3 bg-rose-500 rounded-xl lg:rounded-2xl text-white">
              <TrendingDown size={20} className="lg:w-6 lg:h-6" />
           </div>
           <div>
              <p className="text-rose-600 text-[10px] lg:text-xs font-bold uppercase tracking-wider">{t.totalExpense}</p>
              <p className="text-xl lg:text-2xl font-black text-rose-700">৳{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 lg:p-8 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2 text-ink">
            <DollarSign className="text-rose-500" />
            {t.addExpense}
          </h2>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-all ${showAdd ? 'bg-ink text-white rotate-45' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            <Plus size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-50 bg-gray-50/30"
            >
              <form onSubmit={handleSubmit} className="p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">{t.date}</label>
                      <input 
                        type="date" 
                        required 
                        value={newExpense.date} 
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                        className="w-full px-4 py-2 lg:py-3 bg-white border border-gray-100 rounded-xl lg:rounded-2xl text-sm" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">{t.category}</label>
                        <button 
                          type="button" 
                          onClick={() => setIsManagingCategories(true)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          {lang === 'bn' ? 'ম্যানেজ করুন' : 'Manage'}
                        </button>
                      </div>
                      <select 
                        required
                        value={newExpense.category} 
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                        className="w-full px-4 py-2 lg:py-3 bg-white border border-gray-100 rounded-xl lg:rounded-2xl text-sm"
                      >
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        {categories.length === 0 && <option value="">{lang === 'bn' ? 'প্রথমে ক্যাটেগরি যোগ করুন' : 'Add category first'}</option>}
                      </select>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">{t.amount} (৳)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        value={newExpense.amount || ''} 
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                        className="w-full px-4 py-2 lg:py-3 bg-white border border-gray-100 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest">{t.description}</label>
                      <input 
                        type="text" 
                        required 
                        placeholder={lang === 'bn' ? "খরচের বিবরণ লিখুন..." : "Enter expense description..."} 
                        value={newExpense.description} 
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                        className="w-full px-4 py-2 lg:py-3 bg-white border border-gray-100 rounded-xl lg:rounded-2xl text-sm" 
                      />
                   </div>
                </div>
                <div className="md:col-span-2 pt-2">
                   <button className="w-full py-3 lg:py-4 bg-ink text-white rounded-xl lg:rounded-2xl font-bold hover:bg-black transition-all shadow-md">{t.save}</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">{t.date}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">{t.category}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">{t.description}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t.amount} (৳)</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(exp => (
                <tr key={exp.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-[10px] lg:text-sm font-medium text-gray-400">{exp.date}</td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5">
                    <span className="text-[10px] lg:text-xs font-bold px-2 lg:px-2.5 py-0.5 lg:py-1 bg-gray-100 rounded-full text-gray-600">{exp.category}</span>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm text-ink font-medium max-w-[120px] lg:max-w-xs truncate">{exp.description}</td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-right font-black text-ink text-xs lg:text-sm">৳{exp.amount.toLocaleString()}</td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-right">
                    <button onClick={() => handleDelete(exp.id)} className="text-gray-200 hover:text-red-500 transition-all p-1">
                      <Trash2 size={16} className="lg:w-5 lg:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className="p-16 lg:p-20 text-center text-gray-400 italic text-sm">
               {lang === 'bn' ? 'কোন খরচের রেকর্ড খুঁজে পাওয়া যায়নি' : 'No expense records found'}
            </div>
          )}
        </div>
      </div>

      <CategoryModal 
        isOpen={isManagingCategories} 
        onClose={() => setIsManagingCategories(false)} 
        categories={categories} 
        lang={lang}
      />
    </div>
  );
}

function CategoryModal({ isOpen, onClose, categories, lang }: { isOpen: boolean, onClose: () => void, categories: ExpenseCategory[], lang: Language }) {
  const [newName, setNewName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addDoc(collection(db, 'expense_categories'), {
        name: newName,
        createdAt: serverTimestamp()
      });
      setNewName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expense_categories');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'bn' ? 'এই ক্যাটেগরি ডিলিট করতে চান? এটি ঐ ক্যাটেগরির খরচ ডিলিট করবে না।' : 'Delete this category? It will not delete associated expenses.')) return;
    try {
      await deleteDoc(doc(db, 'expense_categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'expense_categories');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-ink p-1">
              <X size={24} />
            </button>
            
            <h2 className="text-xl lg:text-2xl font-bold mb-6 text-ink">{lang === 'bn' ? 'ক্যাটেগরি ম্যানেজ করুন' : 'Manage Categories'}</h2>
            
            <form onSubmit={handleAdd} className="mb-6 lg:mb-8 flex gap-2">
              <input 
                type="text" 
                placeholder={lang === 'bn' ? "নতুন ক্যাটেগরির নাম..." : "New category name..."} 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 lg:py-3 bg-gray-50 border border-gray-100 rounded-xl lg:rounded-2xl focus:outline-none focus:border-blue-500 text-sm"
              />
              <button className="bg-ink text-white px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-bold text-sm">{lang === 'bn' ? 'যোগ করুন' : 'Add'}</button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl group transition-all hover:bg-gray-100">
                  <span className="font-medium text-sm text-ink">{c.name}</span>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-gray-400 text-sm italic py-4">{lang === 'bn' ? 'কোন ক্যাটেগরি নেই' : 'No categories'}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

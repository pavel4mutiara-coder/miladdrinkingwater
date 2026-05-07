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
  ChevronDown,
  Search,
  Users
} from 'lucide-react';
import { CompanyExpense, ExpenseCategory } from '../types';
import { translations, Language } from '../locales';

export default function ExpenseManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExpense, setNewExpense] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    category: '', 
    description: '', 
    amount: 0,
    dealerId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simplified query to avoid composite index requirements
    const qExpenses = query(collection(db, 'company_expenses'));
    const unsubscribeExpenses = onSnapshot(qExpenses, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyExpense));
      // Sort in memory
      data.sort((a, b) => {
        const dateCompare = (b.date || "").localeCompare(a.date || "");
        if (dateCompare !== 0) return dateCompare;
        const aTime = (a.createdAt as any)?.toMillis?.() || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setExpenses(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'company_expenses'));

    const qCat = query(collection(db, 'expense_categories'), orderBy('name', 'asc'));
    const unsubscribeCats = onSnapshot(qCat, (snap) => {
      const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseCategory));
      setCategories(cats);
      if (cats.length > 0 && !newExpense.category) {
        setNewExpense(prev => ({ ...prev, category: cats[0].name }));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expense_categories'));

    const qDealers = query(collection(db, 'dealers'), orderBy('name', 'asc'));
    const unsubscribeDealers = onSnapshot(qDealers, (snap) => {
      setDealers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'dealers'));

    return () => {
      unsubscribeExpenses();
      unsubscribeCats();
      unsubscribeDealers();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const expenseData: any = {
        ...newExpense,
        amount: Number(newExpense.amount),
        createdAt: serverTimestamp()
      };
      if (!newExpense.dealerId) delete expenseData.dealerId;
      
      await addDoc(collection(db, 'company_expenses'), expenseData);
      setNewExpense({ ...newExpense, description: '', amount: 0, dealerId: '' });
      setShowAdd(false);
    } catch (err) {
      alert(lang === 'bn' ? 'খরচ রেকর্ড করতে সমস্যা হয়েছে।' : 'Failed to save expense.');
      handleFirestoreError(err, OperationType.CREATE, 'company_expenses');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'company_expenses', id));
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete expense.');
      handleFirestoreError(err, OperationType.DELETE, 'company_expenses');
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const filteredExpenses = expenses.filter(exp => 
    exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight dark:text-white">{t.companyExpenses}</h1>
          <p className="text-gray-500 dark:text-dark-muted text-sm lg:text-base mt-1">{lang === 'bn' ? 'অফিস এবং সাধারণ পরিচালনা ব্যয়' : 'Office and general operational expenses'}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-4 animate-in fade-in slide-in-from-right duration-500">
           <div className="p-2 lg:p-3 bg-rose-500 rounded-xl lg:rounded-2xl text-white">
              <TrendingDown size={20} className="lg:w-6 lg:h-6" />
           </div>
           <div>
              <p className="text-rose-600 dark:text-rose-400 text-[10px] lg:text-xs font-bold uppercase tracking-wider">{t.totalExpense}</p>
              <p className="text-xl lg:text-2xl font-black text-rose-700 dark:text-rose-300">৳{totalExpense.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="bg-white dark:bg-dark-surface rounded-2xl lg:rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
        <div className="p-4 lg:p-8 border-b border-gray-50 dark:border-dark-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2 text-ink dark:text-white shrink-0">
              <DollarSign className="text-rose-500 dark:text-rose-400" />
              {t.addExpense}
            </h2>
            <div className="relative flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-dark-muted" size={16} />
              <input 
                type="text"
                placeholder={lang === 'bn' ? "বিবরণ বা ক্যাটেগরি দিয়ে খুঁজুন..." : "Search description or category..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-dark-muted" size={14} />
              <input 
                type="text"
                placeholder={lang === 'bn' ? "খুঁজুন..." : "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white"
              />
            </div>
            <button 
              onClick={() => {
              const becomingVisible = !showAdd;
              setShowAdd(becomingVisible);
              if (becomingVisible && searchQuery) {
                // Check if the search matches an existing category
                const matched = categories.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
                if (matched) {
                  setNewExpense(prev => ({ ...prev, category: matched.name }));
                }
              }
            }}
            className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-all ${showAdd ? 'bg-ink dark:bg-blue-600 text-white rotate-45' : 'bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg'}`}
          >
            <Plus size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-50 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg/30"
            >
              <form onSubmit={handleSubmit} className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.date}</label>
                      <input 
                        type="date" 
                        required 
                        value={newExpense.date} 
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10" 
                      />
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.category}</label>
                        <button 
                          type="button" 
                          onClick={() => setIsManagingCategories(true)}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {lang === 'bn' ? 'ম্যানেজ' : 'Manage'}
                        </button>
                      </div>
                      <div className="relative">
                        <select 
                          required
                          value={newExpense.category} 
                          onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                          className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white"
                        >
                          <option value="" disabled className="dark:bg-dark-surface">{lang === 'bn' ? 'নির্বাচন করুন' : 'Select Category'}</option>
                          {categories.map(c => <option key={c.id} value={c.name} className="dark:bg-dark-surface">{c.name}</option>)}
                          {categories.length === 0 && <option value="" disabled className="dark:bg-dark-surface">{lang === 'bn' ? 'প্রথমে ক্যাটেগরি যোগ করুন' : 'No categories available'}</option>}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted pointer-events-none" size={16} />
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.amount} (৳)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="0" 
                        value={newExpense.amount || ''} 
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                        className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.description}</label>
                      <input 
                        type="text" 
                        required 
                        placeholder={lang === 'bn' ? "খরচের বিবরণ..." : "Enter description..."} 
                        value={newExpense.description} 
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{lang === 'bn' ? 'ডিলার (ঐচ্ছিক)' : 'Dealer (Optional)'}</label>
                      <div className="relative">
                        <select 
                          value={newExpense.dealerId} 
                          onChange={e => setNewExpense({...newExpense, dealerId: e.target.value})} 
                          className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-white"
                        >
                          <option value="">{lang === 'bn' ? 'প্রযোজ্য নয়' : 'Not Applicable'}</option>
                          {dealers.map(d => <option key={d.id} value={d.id} className="dark:bg-dark-surface">{d.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted pointer-events-none" size={16} />
                      </div>
                   </div>
                </div>
                <div className="md:col-span-2 pt-2">
                   <button className="w-full py-3.5 bg-ink dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-blue-700 transition-all shadow-md text-sm">{t.save}</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50 dark:bg-dark-bg/50">
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.date}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.category}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.description}</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest text-right">{t.amount} (৳)</th>
                <th className="px-4 lg:px-8 py-3 lg:py-4 text-[10px] lg:text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="group hover:bg-gray-50/30 dark:hover:bg-dark-bg/30 transition-colors">
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-[10px] lg:text-sm font-medium text-gray-400 dark:text-dark-muted">{exp.date}</td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5">
                    <span className="text-[10px] lg:text-xs font-bold px-2 lg:px-2.5 py-0.5 lg:py-1 bg-gray-100 dark:bg-dark-bg rounded-full text-gray-600 dark:text-dark-muted">{exp.category}</span>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-xs lg:text-sm text-ink dark:text-white font-medium max-w-[120px] lg:max-w-xs truncate">
                    {exp.description}
                    {exp.dealerId && (
                      <span className="block text-[9px] text-blue-500 mt-1 font-bold">
                        <Users size={8} className="inline mr-1" />
                        {dealers.find(d => d.id === exp.dealerId)?.name || 'Unknown Dealer'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-right font-black text-ink dark:text-white text-xs lg:text-sm">৳{exp.amount.toLocaleString()}</td>
                  <td className="px-4 lg:px-8 py-4 lg:py-5 text-right">
                    <button onClick={() => handleDelete(exp.id)} className="text-gray-200 dark:text-dark-muted hover:text-red-500 transition-all p-1">
                      <Trash2 size={16} className="lg:w-5 lg:h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="p-16 lg:p-20 text-center text-gray-400 dark:text-dark-muted italic text-sm">
               {searchQuery 
                 ? (lang === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No matching records found')
                 : (lang === 'bn' ? 'কোন খরচের রেকর্ড খুঁজে পাওয়া যায়নি' : 'No expense records found')
               }
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
      alert(lang === 'bn' ? 'ক্যাটেগরি যোগ করতে সমস্যা হয়েছে।' : 'Failed to add category.');
      handleFirestoreError(err, OperationType.CREATE, 'expense_categories');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'bn' ? 'এই ক্যাটেগরি ডিলিট করতে চান? এটি ঐ ক্যাটেগরির খরচ ডিলিট করবে না।' : 'Delete this category? It will not delete associated expenses.')) return;
    try {
      await deleteDoc(doc(db, 'expense_categories', id));
    } catch (err) {
      alert(lang === 'bn' ? 'ক্যাটেগরি ডিলিট করতে সমস্যা হয়েছে।' : 'Failed to delete category.');
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
            className="bg-white dark:bg-dark-surface rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl relative border dark:border-dark-border"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 dark:text-dark-muted hover:text-ink dark:hover:text-white p-1">
              <X size={24} />
            </button>
            
            <h2 className="text-xl lg:text-2xl font-bold mb-6 text-ink dark:text-white">{lang === 'bn' ? 'ক্যাটেগরি ম্যানেজ করুন' : 'Manage Categories'}</h2>
            
            <form onSubmit={handleAdd} className="mb-6 lg:mb-8 flex gap-2">
              <input 
                type="text" 
                placeholder={lang === 'bn' ? "নতুন ক্যাটেগরির নাম..." : "New category name..."} 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 px-4 py-2 lg:py-3 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl lg:rounded-2xl focus:outline-none focus:border-blue-500 dark:text-white text-sm"
              />
              <button className="bg-ink dark:bg-blue-600 text-white px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-bold text-sm hover:bg-black dark:hover:bg-blue-700 transition-colors uppercase tracking-wider">{lang === 'bn' ? 'যোগ করুন' : 'Add'}</button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-xl lg:rounded-2xl group transition-all hover:bg-gray-100 dark:hover:bg-dark-bg">
                  <span className="font-medium text-sm text-ink dark:text-white">{c.name}</span>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-300 dark:text-dark-muted hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-gray-400 dark:text-dark-muted text-sm italic py-4">{lang === 'bn' ? 'কোন ক্যাটেগরি নেই' : 'No categories'}</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

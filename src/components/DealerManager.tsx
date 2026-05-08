import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, orderBy, where, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  MapPin, 
  Phone, 
  Droplets,
  DollarSign,
  ChevronRight,
  X,
  Calendar,
  Layers,
  Pencil,
  Check
} from 'lucide-react';
import { Dealer, WaterSale } from '../types';
import { translations, Language } from '../locales';
import ConfirmModal from './ui/ConfirmModal';

export default function DealerManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [isEditingDealer, setIsEditingDealer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDealer, setNewDealer] = useState({ name: '', address: '', phone: '' });
  const [editDealer, setEditDealer] = useState({ id: '', name: '', address: '', phone: '' });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null; type: 'dealer' | 'sale' }>({ isOpen: false, id: null, type: 'dealer' });

  useEffect(() => {
    const q = query(collection(db, 'dealers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDealers(snap.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as Dealer)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'dealers'));
    return () => unsubscribe();
  }, []);

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  const handleAddDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealer.name || isSaving) {
      if (!newDealer.name) alert(lang === 'bn' ? 'নাম প্রয়োজন' : 'Name is required');
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'dealers'), {
        ...newDealer,
        createdAt: serverTimestamp()
      });
      setNewDealer({ name: '', address: '', phone: '' });
      setIsAddingDealer(false);
    } catch (err) {
      alert(lang === 'bn' ? 'ডিলার যোগ করতে সমস্যা হয়েছে।' : 'Failed to add dealer.');
      handleFirestoreError(err, OperationType.CREATE, 'dealers');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDealer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'dealers', id));
      if (selectedDealer?.id === id) setSelectedDealer(null);
    } catch (err) {
      console.error("Dealer Delete Error:", err);
      alert(lang === 'bn' ? 'ডিলার মুছতে সমস্যা হয়েছে। দয়া করে এডমিন এক্সেস আছে কি না নিশ্চিত করুন।' : 'Failed to delete dealer. Please ensure you have admin access.');
      handleFirestoreError(err, OperationType.DELETE, 'dealers');
    }
  };

  const handleStartEdit = (dealer: Dealer) => {
    setEditDealer({
      id: dealer.id,
      name: dealer.name,
      address: dealer.address || '',
      phone: dealer.phone || ''
    });
    setIsEditingDealer(true);
  };

  const handleUpdateDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDealer.name || isSaving) return;
    if (!window.confirm(t.confirmUpdate)) return;

    setIsSaving(true);
    try {
      const dealerRef = doc(db, 'dealers', editDealer.id);
      const { id, ...updateData } = editDealer;
      
      await updateDoc(dealerRef, updateData);
      setIsEditingDealer(false);
      
      if (selectedDealer?.id === editDealer.id) {
        setSelectedDealer({ ...selectedDealer, ...updateData });
      }
    } catch (err) {
      alert(lang === 'bn' ? 'ডিলার তথ্য আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update dealer.');
      handleFirestoreError(err, OperationType.UPDATE, 'dealers');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Dealer List */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 ${selectedDealer ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <Users size={24} className="text-cyan-600 dark:text-cyan-400" />
            {t.dealerList}
          </h2>
          <button 
            onClick={() => setIsAddingDealer(true)}
            className="p-2 bg-ink dark:bg-blue-600 text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" size={18} />
          <input 
            type="text" 
            placeholder={t.searchDealer} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] pb-4">
          {filteredDealers.map(d => (
            <motion.div
              layout
              key={d.id}
              onClick={() => setSelectedDealer(d)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all h-fit ${
                selectedDealer?.id === d.id 
                  ? 'bg-cyan-600 dark:bg-blue-600 text-white border-cyan-600 dark:border-blue-500 shadow-lg shadow-cyan-600/10' 
                  : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-dark-border hover:border-cyan-200 dark:hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold dark:text-white truncate">{d.name}</p>
                  <p className={`text-xs mt-1 ${selectedDealer?.id === d.id ? 'text-cyan-100' : 'text-gray-400 dark:text-dark-muted'} flex items-center gap-1 truncate`}>
                    <MapPin size={12} className="shrink-0" /> {d.address || (lang === 'bn' ? 'ঠিকানা নেই' : 'No address')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(d); }}
                    className={`${selectedDealer?.id === d.id ? 'text-cyan-100 dark:text-blue-100 hover:text-white' : 'text-gray-300 dark:text-dark-muted hover:text-blue-500'} transition-colors p-1.5`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: d.id, type: 'dealer' }); }}
                    className={`relative z-10 p-1.5 rounded-xl transition-all ${selectedDealer?.id === d.id ? 'text-cyan-800 dark:text-blue-900/50 hover:text-white' : 'text-gray-300 dark:text-dark-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {dealers.length === 0 && <p className="text-center text-gray-400 dark:text-dark-muted py-10 italic col-span-full">{lang === 'bn' ? 'কোন ডিলার যোগ করা হয়নি' : 'No dealers added'}</p>}
        </div>
      </div>

      {/* Details & Sales */}
      <div className={`flex-1 ${!selectedDealer ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
        <AnimatePresence mode="wait">
          {selectedDealer ? (
            <motion.div
              key={selectedDealer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 lg:space-y-8"
            >
              {/* Dealer Profile Card */}
              <div className="bg-white dark:bg-dark-surface p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-dark-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                      onClick={() => setSelectedDealer(null)}
                      className="lg:hidden p-2 text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg rounded-xl"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-ink dark:text-white mb-1 truncate max-w-[200px] sm:max-w-none">{selectedDealer.name}</h1>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs lg:text-sm">
                        <span className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg px-2 sm:px-3 py-1 lg:py-1.5 rounded-full truncate max-w-[150px] sm:max-w-none">
                          <MapPin size={10} className="sm:w-[14px] sm:h-[14px] text-cyan-600 dark:text-cyan-400" />
                          {selectedDealer.address}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg px-2 sm:px-3 py-1 lg:py-1.5 rounded-full">
                          <Phone size={10} className="sm:w-[14px] sm:h-[14px] text-cyan-600 dark:text-cyan-400" />
                          {selectedDealer.phone}
                        </span>
                        <button 
                          onClick={() => handleStartEdit(selectedDealer)}
                          className="flex items-center gap-1 sm:gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1 lg:py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium"
                        >
                          <Pencil size={10} className="sm:w-3 sm:h-3" />
                          {lang === 'bn' ? 'পরিবর্তন' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-2">
                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center">
                       <Users className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Sales Section */}
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white dark:bg-dark-surface p-4 lg:p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
                  <SalesRecorder dealerId={selectedDealer.id} lang={lang} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <Users size={48} className="mb-4 opacity-10" />
              <p>{t.noDealer}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => confirmModal.id && handleDeleteDealer(confirmModal.id)}
        title={t.deleteDealerConfirm}
        message={lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই ডিলারকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this dealer?'}
        confirmText={t.delete}
        cancelText={t.close}
      />

      {/* Add Dealer Modal */}
      <AnimatePresence>
        {isAddingDealer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-surface rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-dark-border max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8 shrink-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black dark:text-white">{t.addDealer}</h2>
                <button onClick={() => setIsAddingDealer(false)} className="text-gray-400 dark:text-dark-muted hover:text-ink bg-gray-50 dark:bg-dark-bg p-2 rounded-full">
                  <X />
                </button>
              </div>
            <form onSubmit={handleAddDealer} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerName}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.name} 
                    onChange={e => setNewDealer({...newDealer, name: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerAddress}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.address} 
                    onChange={e => setNewDealer({...newDealer, address: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerPhone}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.phone} 
                    onChange={e => setNewDealer({...newDealer, phone: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-ink dark:bg-blue-600 text-white rounded-xl font-bold mt-2 hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-sm">{t.save}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Dealer Modal */}
      <AnimatePresence>
        {isEditingDealer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-surface rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-dark-border max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8 shrink-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black dark:text-white">{t.editDealer}</h2>
                <button onClick={() => setIsEditingDealer(false)} className="text-gray-400 dark:text-dark-muted hover:text-ink bg-gray-50 dark:bg-dark-bg p-2 rounded-full">
                  <X />
                </button>
              </div>
              <form onSubmit={handleUpdateDealer} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerName}</label>
                  <input 
                    type="text" 
                    required
                    value={editDealer.name} 
                    onChange={e => setEditDealer({...editDealer, name: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerAddress}</label>
                  <input 
                    type="text" 
                    required
                    value={editDealer.address} 
                    onChange={e => setEditDealer({...editDealer, address: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.dealerPhone}</label>
                  <input 
                    type="text" 
                    required
                    value={editDealer.phone} 
                    onChange={e => setEditDealer({...editDealer, phone: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white text-sm" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-ink dark:bg-blue-600 text-white rounded-xl font-bold mt-2 hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 text-sm"
                >
                  {isSaving ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : t.update}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SalesRecorder({ dealerId, lang }: { dealerId: string, lang: Language }) {
  const t = translations[lang];
  const [sales, setSales] = useState<WaterSale[]>([]);
  const [dealerExpenses, setDealerExpenses] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [isEditingSale, setIsEditingSale] = useState(false);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    productType: '20L Jar' as '20L Jar' | '5L Bottle' | 'Other', 
    quantity: 0, 
    unitPrice: 0,
    totalAmount: 0
  });
  const [editSaleForm, setEditSaleForm] = useState<WaterSale | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  // Sync total amount when qty or price changes for the ADD form
  useEffect(() => {
    const total = form.quantity * form.unitPrice;
    if (form.totalAmount !== total) {
      setForm(prev => ({ ...prev, totalAmount: total }));
    }
  }, [form.quantity, form.unitPrice]);

  const handleTotalChange = (val: number) => {
    setForm(prev => {
      const newUnitPrice = prev.quantity > 0 ? Number((val / prev.quantity).toFixed(2)) : prev.unitPrice;
      return { ...prev, totalAmount: val, unitPrice: newUnitPrice };
    });
  };

  useEffect(() => {
    // Simplified query to avoid composite index requirements
    const q = query(
      collection(db, 'water_sales'), 
      where('dealerId', '==', dealerId)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      // Sort in memory
      const salesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as WaterSale));
      salesData.sort((a, b) => {
        // Primary sort: date
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        // Secondary sort: createdAt
        const aTime = (a.createdAt as any)?.toMillis?.() || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setSales(salesData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'water_sales'));
    return () => unsubscribe();
  }, [dealerId]);

  useEffect(() => {
    const q = query(
      collection(db, 'company_expenses'),
      where('dealerId', '==', dealerId)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setDealerExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'company_expenses'));
    return () => unsubscribe();
  }, [dealerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || form.quantity <= 0) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'water_sales'), {
        ...form,
        dealerId,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setForm({ ...form, quantity: 0, unitPrice: 0, totalAmount: 0 }); 
    } catch (err) {
      alert(lang === 'bn' ? 'বিক্রয় তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save sales record.');
      handleFirestoreError(err, OperationType.CREATE, 'water_sales');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditSale = (sale: WaterSale) => {
    setEditSaleForm(sale);
    setIsEditingSale(true);
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSaleForm || isSaving) return;

    setIsSaving(true);
    try {
      const saleRef = doc(db, 'water_sales', editSaleForm.id);
      
      const updateData = {
        dealerId: editSaleForm.dealerId,
        date: editSaleForm.date,
        productType: editSaleForm.productType,
        quantity: Number(editSaleForm.quantity),
        unitPrice: Number(editSaleForm.unitPrice),
        totalAmount: Number(editSaleForm.totalAmount),
        updatedAt: serverTimestamp()
      };

      await updateDoc(saleRef, updateData);
      setIsEditingSale(false);
      setEditSaleForm(null);
      // Optional: Add a success feedback briefly if needed, but closing modal is standard
    } catch (err) {
      console.error("Sale Update Error:", err);
      alert(lang === 'bn' ? 'বিক্রয় তথ্য আপডেট করতে সমস্যা হয়েছে। দয়া করে এডমিন প্যানেল চেক করুন।' : 'Failed to update sale. Please check admin permissions.');
      handleFirestoreError(err, OperationType.UPDATE, 'water_sales');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'water_sales', id));
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' : 'Failed to delete. Please try again.');
      handleFirestoreError(err, OperationType.DELETE, 'water_sales');
    }
  };

  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalDealerExpense = dealerExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards for Dealer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-50 dark:border-dark-border">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
            <p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.totalSold}</p>
            <p className="text-xl font-black text-blue-700 dark:text-blue-300">
              {totalQuantity.toLocaleString()} <span className="text-xs font-normal">{lang === 'bn' ? 'টি/যার' : 'Pcs/Jar'}</span>
            </p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
            <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.totalEarned}</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">৳{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/30">
            <p className="text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest mb-1">{lang === 'bn' ? 'ডিলারের মোট খরচ' : "Dealer's Total Expense"}</p>
            <p className="text-xl font-black text-rose-700 dark:text-rose-300">৳{totalDealerExpense.toLocaleString()}</p>
          </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-border pb-4">
        <h3 className="text-lg lg:text-xl font-bold flex items-center gap-2 dark:text-white">
          <Droplets className="text-blue-500 dark:text-blue-400" />
          {t.waterSalesRecord}
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            showAdd 
              ? 'bg-ink dark:bg-blue-600 text-white' 
              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
          }`}
        >
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? t.close : t.addSale}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 dark:bg-dark-bg/50 border border-gray-100 dark:border-dark-border p-4 rounded-3xl mb-6 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.date}</label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border-none rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.product}</label>
                <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value as any})} className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border-none rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 appearance-none">
                  <option value="20L Jar">{lang === 'bn' ? '২০লি যার' : '20L Jar'}</option>
                  <option value="5L Bottle">{lang === 'bn' ? '৫লি বোতল' : '5L Bottle'}</option>
                  <option value="Other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.quantity}</label>
                <input type="number" required placeholder="0" value={form.quantity || ''} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border-none rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest ml-1">{t.unitPrice}</label>
                <input type="number" required placeholder="0" value={form.unitPrice || ''} onChange={e => setForm({...form, unitPrice: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-white dark:bg-dark-surface border-none rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="col-span-2 lg:col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest ml-1">{lang === 'bn' ? 'মোট টাকা' : 'Total Amount'}</label>
                <input type="number" required placeholder="0" value={form.totalAmount || ''} onChange={e => handleTotalChange(Number(e.target.value))} className="w-full px-4 py-2.5 border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10"
              >
                {isSaving ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : t.save}
              </button>
              <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-6 py-2.5 bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-muted rounded-xl text-xs font-bold"
              >
                {t.close}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50 dark:bg-dark-bg/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.date}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.product}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest text-center">{t.quantity}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest text-right">{t.unitPrice} (৳)</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest text-right">{t.total} (৳)</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {sales.map(sale => (
                <tr key={sale.id} className="group hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                  <td className="px-4 py-4 text-[10px] lg:text-xs font-medium text-gray-400 dark:text-dark-muted">{sale.date}</td>
                  <td className="px-4 py-4 text-xs font-bold text-ink dark:text-white">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${sale.productType === '20L Jar' ? 'bg-blue-500' : 'bg-cyan-500'}`} />
                         {sale.productType}
                      </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-center font-bold font-mono dark:text-white">{sale.quantity}</td>
                  <td className="px-4 py-4 text-xs text-right font-mono text-gray-500 dark:text-dark-muted">৳{sale.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-4 text-emerald-600 dark:text-emerald-400 text-xs text-right font-black font-mono pr-2">৳{sale.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleStartEditSale(sale)} 
                         className="text-gray-300 dark:text-dark-muted hover:text-blue-500 transition-all p-1"
                       >
                          <Pencil size={14} />
                       </button>
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: sale.id }); }} 
                         className="text-gray-200 dark:text-dark-muted hover:text-red-500 transition-all p-1"
                       >
                          <Trash2 size={14} />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-3">
          {sales.map(sale => (
            <div key={sale.id} className="bg-gray-50 dark:bg-dark-bg/40 p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sale.productType === '20L Jar' ? 'bg-blue-500' : 'bg-cyan-500'}`} />
                  <span className="text-xs font-bold dark:text-white">{sale.productType}</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 dark:text-dark-muted">{sale.date}</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 dark:text-dark-muted uppercase font-bold tracking-widest">{t.quantity} & {t.unitPrice}</p>
                  <p className="text-xs font-bold dark:text-white">
                    {sale.quantity} × ৳{sale.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest">{t.total}</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">৳{sale.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border/50">
                <button 
                  onClick={() => handleStartEditSale(sale)}
                  className="p-2 text-gray-400 hover:text-blue-500 bg-white dark:bg-dark-surface rounded-lg transition-colors border border-gray-100 dark:border-dark-border"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: sale.id }); }}
                  className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-dark-surface rounded-lg transition-colors border border-gray-100 dark:border-dark-border"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {sales.length === 0 && <p className="text-center text-gray-400 dark:text-dark-muted py-10 italic text-sm">{t.noSalesReport}</p>}
      </div>

      {/* Edit Sale Modal */}
      <AnimatePresence>
        {isEditingSale && editSaleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-surface rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-dark-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black dark:text-white">{t.editSale}</h2>
                <button onClick={() => setIsEditingSale(false)} className="text-gray-400 dark:text-dark-muted hover:text-ink bg-gray-50 dark:bg-dark-bg p-2 rounded-full">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdateSale} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.1em] ml-1">{t.date}</label>
                    <input 
                      type="date" 
                      required
                      value={editSaleForm.date} 
                      onChange={e => setEditSaleForm({...editSaleForm, date: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.1em] ml-1">{t.product}</label>
                    <select 
                      value={editSaleForm.productType} 
                      onChange={e => setEditSaleForm({...editSaleForm, productType: e.target.value as any})} 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white appearance-none"
                    >
                      <option value="20L Jar">২০লি যার</option>
                      <option value="5L Bottle">৫লি বোতল</option>
                      <option value="Other">অন্যান্য</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.1em] ml-1">{t.quantity}</label>
                    <input 
                      type="number" 
                      required
                      value={editSaleForm.quantity || ''} 
                      onChange={e => {
                        const q = Number(e.target.value);
                        setEditSaleForm({
                          ...editSaleForm, 
                          quantity: q,
                          totalAmount: Number((q * editSaleForm.unitPrice).toFixed(2))
                        });
                      }} 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.1em] ml-1">{t.unitPrice}</label>
                    <input 
                      type="number" 
                      required
                      value={editSaleForm.unitPrice || ''} 
                      onChange={e => {
                        const p = Number(e.target.value);
                        setEditSaleForm({
                          ...editSaleForm, 
                          unitPrice: p,
                          totalAmount: Number((editSaleForm.quantity * p).toFixed(2))
                        });
                      }} 
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em] ml-1">{lang === 'bn' ? 'মোট টাকা' : 'Total Amount'}</label>
                    <input 
                      type="number" 
                      required
                      value={editSaleForm.totalAmount || ''} 
                      onChange={e => {
                        const tAmount = Number(e.target.value);
                        const newPrice = editSaleForm.quantity > 0 ? Number((tAmount / editSaleForm.quantity).toFixed(2)) : editSaleForm.unitPrice;
                        setEditSaleForm({
                          ...editSaleForm, 
                          totalAmount: tAmount,
                          unitPrice: newPrice
                        });
                      }} 
                      className="w-full px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold mt-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 text-sm"
                >
                  {isSaving ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : t.update}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sales Summary Section - Hidden as it is moved up */}
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => confirmModal.id && deleteSale(confirmModal.id)}
        title={t.confirmDelete}
        message={lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই বিক্রয় তথ্য মুছে ফেলতে চান?' : 'Are you sure you want to delete this sale record?'}
        confirmText={t.delete}
        cancelText={t.close}
      />
    </div>
  );
}

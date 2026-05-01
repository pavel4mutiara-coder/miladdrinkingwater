import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, orderBy, where, serverTimestamp } from 'firebase/firestore';
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
  Layers
} from 'lucide-react';
import { Dealer, WaterSale } from '../types';
import { translations, Language } from '../locales';

export default function DealerManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDealer, setNewDealer] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, 'dealers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDealers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer)));
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
    if (!newDealer.name) return;
    try {
      await addDoc(collection(db, 'dealers'), {
        ...newDealer,
        createdAt: serverTimestamp()
      });
      setNewDealer({ name: '', address: '', phone: '' });
      setIsAddingDealer(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'dealers');
    }
  };

  const handleDeleteDealer = async (id: string) => {
    if (!window.confirm(t.deleteDealerConfirm)) return;
    try {
      await deleteDoc(doc(db, 'dealers', id));
      if (selectedDealer?.id === id) setSelectedDealer(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'dealers');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Dealer List */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 ${selectedDealer ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={24} className="text-cyan-600" />
            {t.dealerList}
          </h2>
          <button 
            onClick={() => setIsAddingDealer(true)}
            className="p-2 bg-ink text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={t.searchDealer} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
          />
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] pb-4">
          {filteredDealers.map(d => (
            <motion.div
              layout
              key={d.id}
              onClick={() => setSelectedDealer(d)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                selectedDealer?.id === d.id 
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/10' 
                  : 'bg-white border-gray-100 hover:border-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{d.name}</p>
                  <p className={`text-xs mt-1 ${selectedDealer?.id === d.id ? 'text-cyan-100' : 'text-gray-400'} flex items-center gap-1`}>
                    <MapPin size={12} /> {d.address || (lang === 'bn' ? 'ঠিকানা নেই' : 'No address')}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteDealer(d.id); }}
                  className={`${selectedDealer?.id === d.id ? 'text-cyan-800' : 'text-gray-300'} hover:text-red-500 transition-colors`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {dealers.length === 0 && <p className="text-center text-gray-400 py-10 italic">{lang === 'bn' ? 'কোন ডিলার যোগ করা হয়নি' : 'No dealers added'}</p>}
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
              <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedDealer(null)}
                      className="lg:hidden p-2 text-gray-400 bg-gray-50 rounded-full"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-black text-ink mb-1">{selectedDealer.name}</h1>
                      <div className="flex flex-wrap gap-3 text-xs lg:text-sm">
                        <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 lg:py-1.5 rounded-full">
                          <MapPin size={14} className="text-cyan-600" />
                          {selectedDealer.address}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 lg:py-1.5 rounded-full">
                          <Phone size={14} className="text-cyan-600" />
                          {selectedDealer.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-2">
                    <div className="p-4 bg-cyan-50 rounded-2xl flex items-center justify-center">
                       <Users className="w-8 h-8 text-cyan-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Sales Section */}
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white p-4 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
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

      {/* Add Dealer Modal */}
      <AnimatePresence>
        {isAddingDealer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t.addDealer}</h2>
                <button onClick={() => setIsAddingDealer(false)} className="text-gray-400 hover:text-ink">
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddDealer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.dealerName}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.name} 
                    onChange={e => setNewDealer({...newDealer, name: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.dealerAddress}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.address} 
                    onChange={e => setNewDealer({...newDealer, address: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.dealerPhone}</label>
                  <input 
                    type="text" 
                    required
                    value={newDealer.phone} 
                    onChange={e => setNewDealer({...newDealer, phone: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold mt-4 hover:bg-cyan-700 transition-all">{t.save}</button>
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
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    productType: '20L Jar' as '20L Jar' | '5L Bottle' | 'Other', 
    quantity: 0, 
    rate: 0 
  });

  useEffect(() => {
    const q = query(
      collection(db, 'water_sales'), 
      where('dealerId', '==', dealerId),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setSales(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterSale)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'water_sales'));
    return () => unsubscribe();
  }, [dealerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = form.quantity * form.rate;
    try {
      await addDoc(collection(db, 'water_sales'), {
        ...form,
        dealerId,
        totalAmount,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setForm({ ...form, quantity: 0 }); 
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'water_sales');
    }
  };

  const deleteSale = async (id: string) => {
    if (!window.confirm(t.deleteSaleConfirm)) return;
    try {
      await deleteDoc(doc(db, 'water_sales', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'water_sales');
    }
  };

  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <h3 className="text-lg lg:text-xl font-bold flex items-center gap-2">
          <Droplets className="text-blue-500" />
          {t.waterSalesRecord}
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            showAdd ? 'bg-ink text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-6 bg-gray-50 rounded-2xl overflow-hidden"
          >
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.date}</label>
              <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.product}</label>
              <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value as any})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="20L Jar">{lang === 'bn' ? '২০ লিটার যার' : '20L Jar'}</option>
                <option value="5L Bottle">{lang === 'bn' ? '৫ লিটার বোতল' : '5L Bottle'}</option>
                <option value="Other">{lang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.quantity}</label>
              <input type="number" required placeholder="0" value={form.quantity || ''} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.rate} (৳)</label>
              <div className="flex gap-2">
                <input type="number" required placeholder="0" value={form.rate || ''} onChange={e => setForm({...form, rate: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                <button type="submit" className="bg-ink text-white px-4 py-2 mt-1 rounded-xl text-xs font-bold">{t.save}</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto -mx-4 lg:mx-0">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50/50">
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.date}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.product}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{t.quantity}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t.rate} (৳)</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t.total} (৳)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sales.map(sale => (
              <tr key={sale.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-[10px] lg:text-xs font-medium text-gray-400">{sale.date}</td>
                <td className="px-4 py-4 text-xs font-bold text-ink">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${sale.productType === '20L Jar' ? 'bg-blue-500' : 'bg-cyan-500'}`} />
                       {sale.productType}
                    </div>
                </td>
                <td className="px-4 py-4 text-xs text-center font-bold font-mono">{sale.quantity}</td>
                <td className="px-4 py-4 text-xs text-right font-mono text-gray-500">৳{sale.rate.toLocaleString()}</td>
                <td className="px-4 py-4 text-xs text-right font-black font-mono pr-2 text-emerald-600">৳{sale.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-4 text-right">
                   <button onClick={() => deleteSale(sale.id)} className="text-gray-200 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && <p className="text-center text-gray-400 py-10 italic text-sm">{t.noSalesReport}</p>}
      </div>

      {/* Sales Summary Section */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
          <div className="bg-blue-50/50 p-4 lg:p-6 rounded-2xl border border-blue-100/50">
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-1">{t.totalSold}</p>
            <p className="text-lg lg:text-xl font-black text-blue-700">
              {totalQuantity.toLocaleString()} <span className="text-xs font-normal">{lang === 'bn' ? 'টি/যার' : 'Pcs/Jar'}</span>
            </p>
          </div>
          <div className="bg-emerald-50/50 p-4 lg:p-6 rounded-2xl border border-emerald-100/50">
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">{t.totalEarned}</p>
            <p className="text-lg lg:text-xl font-black text-emerald-700">
              ৳{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

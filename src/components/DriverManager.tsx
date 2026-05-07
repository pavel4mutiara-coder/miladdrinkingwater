import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  Phone, 
  MapPin, 
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Driver } from '../types';
import { translations, Language } from '../locales';
import ImageUpload from './ui/ImageUpload';

interface DriverManagerProps {
  lang: Language;
}

export default function DriverManager({ lang }: DriverManagerProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[lang];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    nid: '',
    licenseNumber: '',
    emergencyContact: '',
    photoURL: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'drivers'));
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (editingDriver) {
        await updateDoc(doc(db, 'drivers', editingDriver.id), {
          ...form,
          updatedAt: Timestamp.now()
        });
      } else {
        await addDoc(collection(db, 'drivers'), {
          ...form,
          createdAt: Timestamp.now()
        });
      }
      resetForm();
    } catch (err) {
      alert(lang === 'bn' ? 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save driver info');
      handleFirestoreError(err, OperationType.WRITE, 'drivers');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      address: driver.address,
      nid: driver.nid,
      licenseNumber: driver.licenseNumber,
      emergencyContact: driver.emergencyContact,
      photoURL: driver.photoURL || ''
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'drivers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'drivers');
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', nid: '', licenseNumber: '', emergencyContact: '', photoURL: '' });
    setEditingDriver(null);
    setIsAdding(false);
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery) ||
    d.nid.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black dark:text-white">{t.drivers}</h2>
          <p className="text-gray-400 dark:text-dark-muted text-sm">{lang === 'bn' ? 'সব ড্রাইভারদের তালিকা ও তথ্য' : 'List and information of all drivers'}</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> {t.addDriver}
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text"
          placeholder={lang === 'bn' ? 'ড্রাইভার খুজুন...' : t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDrivers.map((driver) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={driver.id}
              className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-gray-50 dark:border-dark-border shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border-2 border-gray-50 dark:border-dark-border">
                    {driver.photoURL ? (
                      <img src={driver.photoURL} className="w-full h-full object-cover" alt={driver.name} />
                    ) : (
                      <User className="text-blue-600 dark:text-blue-400" size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg dark:text-white">{driver.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 dark:text-dark-muted text-xs">
                      <Phone size={12} /> {driver.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(driver)} className="p-2 bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-blue-500 rounded-xl transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(driver.id)} className="p-2 bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl">
                  <MapPin className="text-gray-400 mt-1" size={16} />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{t.driverAddress}</p>
                    <p className="text-sm dark:text-gray-300 font-medium">{driver.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl">
                    <CreditCard className="text-gray-400 mb-1" size={16} />
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{t.nid}</p>
                    <p className="text-sm dark:text-gray-300 font-medium">{driver.nid}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl">
                    <ShieldCheck className="text-gray-400 mb-1" size={16} />
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">LICENSE</p>
                    <p className="text-sm dark:text-gray-300 font-medium">{driver.licenseNumber}</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                  <p className="text-[10px] text-red-400 uppercase font-black tracking-widest">{t.emergencyContact}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-bold">{driver.emergencyContact}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
          >
            <div className="p-6 border-b border-gray-50 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-bg/50">
              <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <User size={18} />
                </div>
                {editingDriver ? t.editDriver : t.addDriver}
              </h3>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <ImageUpload 
                label={t.driverPhoto}
                currentImageUrl={form.photoURL}
                onUploadComplete={(url) => setForm({...form, photoURL: url})}
                onRemove={() => setForm({...form, photoURL: ''})}
                folder="drivers"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.driverName}</label>
                  <input 
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Abul Kashem"
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.driverPhone}</label>
                  <input 
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.nid}</label>
                  <input 
                    required
                    type="text"
                    value={form.nid}
                    onChange={(e) => setForm({...form, nid: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.licenseNumber}</label>
                  <input 
                    required
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({...form, licenseNumber: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.emergency}</label>
                  <input 
                    required
                    type="tel"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({...form, emergencyContact: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-1.5 block">{t.driverAddress}</label>
                  <textarea 
                    required
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white h-20 resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <><Save size={18} /> {editingDriver ? t.update : t.save}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  History, 
  DollarSign,
  Wrench,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle
} from 'lucide-react';
import { Vehicle, Maintenance, VehicleIncome } from '../types';

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', name: '', type: '' });

  useEffect(() => {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      setVehicles(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles'));
    return () => unsubscribe();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber) return;
    try {
      await addDoc(collection(db, 'vehicles'), {
        ...newVehicle,
        createdAt: serverTimestamp()
      });
      setNewVehicle({ vehicleNumber: '', name: '', type: '' });
      setIsAddingVehicle(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'vehicles');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই গাড়িটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      if (selectedVehicle?.id === id) setSelectedVehicle(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'vehicles');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Vehicle List */}
      <div className="lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck size={24} className="text-blue-600" />
            গাড়ির তালিকা
          </h2>
          <button 
            onClick={() => setIsAddingVehicle(true)}
            className="p-2 bg-ink text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {vehicles.map(v => (
            <motion.div
              layout
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                selectedVehicle?.id === v.id 
                  ? 'bg-ink text-white border-ink shadow-lg shadow-black/10' 
                  : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{v.vehicleNumber}</p>
                  <p className={`text-sm ${selectedVehicle?.id === v.id ? 'text-gray-400' : 'text-gray-500'}`}>
                    {v.name || 'গাড়ির নাম নেই'} • {v.type}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(v.id); }}
                  className={`${selectedVehicle?.id === v.id ? 'text-gray-500' : 'text-gray-300'} hover:text-red-500 transition-colors`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {vehicles.length === 0 && (
            <p className="text-center text-gray-400 py-10 italic">কোন গাড়ি যোগ করা হয়নি</p>
          )}
        </div>
      </div>

      {/* Details & Logs */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {selectedVehicle ? (
            <motion.div
              key={selectedVehicle.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div>
                   <h1 className="text-4xl font-black">{selectedVehicle.vehicleNumber}</h1>
                   <p className="text-gray-500">{selectedVehicle.name} • {selectedVehicle.type}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl">
                   <Truck className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <VehicleLogSection 
                    title="মেরামত ও যত্ন" 
                    icon={<Wrench size={20} />} 
                    vehicleId={selectedVehicle.id} 
                    collectionName="maintenance" 
                    fields={[
                      { name: 'partsReplaced', label: 'পরিবর্তিত পার্টস', type: 'text' },
                      { name: 'description', label: 'বিবরণ', type: 'textarea' },
                      { name: 'cost', label: 'খরচ (৳)', type: 'number' },
                      { name: 'date', label: 'তারিখ', type: 'date' }
                    ]}
                 />
                 <VehicleLogSection 
                    title="দৈনিক ইনকাম" 
                    icon={<DollarSign size={20} />} 
                    vehicleId={selectedVehicle.id} 
                    collectionName="vehicle_income" 
                    fields={[
                      { name: 'amount', label: 'টাকা (৳)', type: 'number' },
                      { name: 'date', label: 'তারিখ', type: 'date' }
                    ]}
                 />
              </div>
            </motion.div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <Truck size={48} className="mb-4 opacity-10" />
              <p>বিস্তারিত দেখতে বাম দিক থেকে গাড়ি নির্বাচন করুন</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isAddingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">নতুন গাড়ি যোগ করুন</h2>
                <button onClick={() => setIsAddingVehicle(false)} className="text-gray-400 hover:text-ink">
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <Input label="গাড়ির নাম্বার (যেমন: সিলেট-ড ১১-২২৩৩)" value={newVehicle.vehicleNumber} onChange={(v) => setNewVehicle({...newVehicle, vehicleNumber: v})} placeholder="সিলেট-ড..." />
                <Input label="গাড়ির নাম/মডেল" value={newVehicle.name} onChange={(v) => setNewVehicle({...newVehicle, name: v})} placeholder="পিকআপ, ভ্যান..." />
                <Input label="ধরণ" value={newVehicle.type} onChange={(v) => setNewVehicle({...newVehicle, type: v})} placeholder="পানির গাড়ি, সাধারণ..." />
                <button type="submit" className="w-full py-4 bg-ink text-white rounded-2xl font-bold mt-4 hover:bg-black transition-all">গাড়ি যোগ করুন</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: any, onChange: (v: any) => void, type?: string, placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
      />
    </div>
  );
}

function VehicleLogSection({ title, icon, vehicleId, collectionName, fields }: { title: string, icon: React.ReactNode, vehicleId: string, collectionName: string, fields: any[] }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const q = query(
      collection(db, collectionName), 
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, collectionName));
    return () => unsubscribe();
  }, [vehicleId, collectionName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, collectionName), {
        ...formData,
        vehicleId,
        cost: formData.cost ? Number(formData.cost) : 0,
        amount: formData.amount ? Number(formData.amount) : 0,
        createdAt: serverTimestamp()
      });
      setFormData({});
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionName);
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, collectionName);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center gap-2">
          <span className="p-2 bg-gray-50 rounded-xl text-gray-500">{icon}</span>
          {title}
        </h3>
        <button 
          onClick={() => {
            setShowAdd(!showAdd);
            setFormData({ date: new Date().toISOString().split('T')[0] });
          }}
          className={`p-2 rounded-xl transition-all ${showAdd ? 'bg-ink text-white rotate-45' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit} 
            className="mb-8 space-y-4 overflow-hidden border-b border-gray-50 pb-8"
          >
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-xs font-bold text-gray-400 uppercase">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea 
                    required 
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})} 
                    className="w-full px-4 py-2 mt-1 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 h-20 text-sm" 
                  />
                ) : (
                  <input 
                    required 
                    type={f.type} 
                    value={formData[f.name] || ''}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})} 
                    className="w-full px-4 py-2 mt-1 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-sm" 
                  />
                )}
              </div>
            ))}
            <button className="w-full py-3 bg-ink text-white rounded-xl text-sm font-bold">সেভ করুন</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {logs.map(log => (
          <div key={log.id} className="group flex items-start gap-4 p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{log.date}</span>
                <span className="font-black text-ink">{log.cost || log.amount ? `৳${(log.cost || log.amount).toLocaleString()}` : ''}</span>
              </div>
              {log.partsReplaced && <p className="text-sm font-bold text-ink mb-1">{log.partsReplaced}</p>}
              {log.description && <p className="text-xs text-gray-500 leading-relaxed">{log.description}</p>}
            </div>
            <button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {logs.length === 0 && <p className="text-center text-gray-400 py-6 text-sm italic">কোন তথ্য নেই</p>}
      </div>
    </div>
  );
}

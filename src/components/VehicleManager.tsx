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
  Search,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Calendar,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Vehicle, Maintenance, VehicleIncome } from '../types';
import { translations, Language } from '../locales';

export default function VehicleManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', name: '', type: '' });

  useEffect(() => {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setVehicles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle)));
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
    if (!window.confirm(t.deleteVehicleConfirm)) return;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      if (selectedVehicle?.id === id) setSelectedVehicle(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'vehicles');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      {/* Sidebar List */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 ${selectedVehicle ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">{t.vehicleList}</h2>
          <button 
            onClick={() => setIsAddingVehicle(true)}
            className="p-2 bg-ink text-white rounded-xl"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? "গাড়ি খুঁজুন..." : "Search vehicles..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] pb-4">
          {filteredVehicles.map(v => (
            <motion.div
              layout
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                selectedVehicle?.id === v.id ? 'bg-ink text-white border-ink shadow-lg ring-4 ring-blue-50' : 'bg-white border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`px-2 py-1 ${selectedVehicle?.id === v.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'} rounded text-[10px] font-black uppercase tracking-tighter`}>
                  {v.vehicleNumber}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(v.id); }}
                  className={`${selectedVehicle?.id === v.id ? 'text-white/50 hover:text-white' : 'text-gray-300 hover:text-red-500'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="font-bold">{v.name}</p>
              <p className={`text-xs ${selectedVehicle?.id === v.id ? 'text-white/60' : 'text-gray-400'}`}>{v.type}</p>
            </motion.div>
          ))}
          {vehicles.length === 0 && <p className="text-center text-gray-400 py-10 italic text-sm">{t.noVehicle}</p>}
        </div>
      </div>

      {/* Details View */}
      <div className={`flex-1 h-full overflow-y-auto pr-0 lg:pr-4 ${!selectedVehicle ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
        {!selectedVehicle ? (
          <div className="text-center">
            <Truck className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">{t.selectVehicle}</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8 pb-10">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setSelectedVehicle(null)}
                   className="lg:hidden p-2 text-gray-400 bg-gray-50 rounded-full"
                 >
                   <ChevronRight className="rotate-180" size={20} />
                 </button>
                 <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-ink mb-1">{selectedVehicle.vehicleNumber}</h1>
                    <p className="text-gray-500 text-sm lg:text-base font-medium">{selectedVehicle.name} • {selectedVehicle.type}</p>
                 </div>
               </div>
               <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.location}</p>
                  <p className="text-ink font-medium text-sm">{t.address}</p>
               </div>
            </div>

            {/* Summary Section */}
            <VehicleSummary vehicleId={selectedVehicle.id} lang={lang} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
               <VehicleLogSection 
                  title={t.maintenanceCare} 
                  icon={<Wrench size={18} />} 
                  vehicleId={selectedVehicle.id} 
                  collectionName="maintenance"
                  lang={lang}
                  fields={[
                    { name: 'date', label: t.date, type: 'date' },
                    { name: 'partsReplaced', label: t.parts, type: 'text' },
                    { name: 'description', label: t.description, type: 'text' },
                    { name: 'cost', label: t.amount, type: 'number' }
                  ]}
               />
               <VehicleLogSection 
                  title={t.dailyIncome} 
                  icon={<History size={18} />} 
                  vehicleId={selectedVehicle.id} 
                  collectionName="vehicle_income"
                  lang={lang}
                  fields={[
                    { name: 'date', label: t.date, type: 'date' },
                    { name: 'amount', label: t.amount, type: 'number' }
                  ]}
               />
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isAddingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAddingVehicle(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-ink"
              >
                <X />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-ink">{t.addVehicle}</h2>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.vehicleNumber}</label>
                    <input 
                      required
                      type="text" 
                      value={newVehicle.vehicleNumber} 
                      onChange={e => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g. D-123"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.vehicleName}</label>
                    <input 
                      required
                      type="text" 
                      value={newVehicle.name} 
                      onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Pickup"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.vehicleType}</label>
                    <input 
                      required
                      type="text" 
                      value={newVehicle.type} 
                      onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Mini Truck"
                    />
                 </div>
                 <button className="w-full bg-ink text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors">{t.save}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VehicleSummary({ vehicleId, lang }: { vehicleId: string, lang: Language }) {
  const t = translations[lang];
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalMaintenance, setTotalMaintenance] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<{ [month: string]: { income: number; maintenance: number } }>({});

  useEffect(() => {
    const qIncome = query(collection(db, 'vehicle_income'), where('vehicleId', '==', vehicleId));
    const unsubIncome = onSnapshot(qIncome, (snap) => {
      let sum = 0;
      const monthly: { [key: string]: number } = {};
      snap.forEach(d => {
        const data = d.data();
        const amount = data.amount || 0;
        sum += amount;
        const month = data.date ? data.date.substring(0, 7) : 'Unknown'; // YYYY-MM
        monthly[month] = (monthly[month] || 0) + amount;
      });
      setTotalIncome(sum);
      setMonthlyStats(prev => {
        const next = { ...prev };
        Object.keys(monthly).forEach(m => {
          if (!next[m]) next[m] = { income: 0, maintenance: 0 };
          next[m].income = monthly[m];
        });
        return next;
      });
    });

    const qMaint = query(collection(db, 'maintenance'), where('vehicleId', '==', vehicleId));
    const unsubMaint = onSnapshot(qMaint, (snap) => {
      let sum = 0;
      const monthly: { [key: string]: number } = {};
      snap.forEach(d => {
        const data = d.data();
        const cost = data.cost || 0;
        sum += cost;
        const month = data.date ? data.date.substring(0, 7) : 'Unknown';
        monthly[month] = (monthly[month] || 0) + cost;
      });
      setTotalMaintenance(sum);
      setMonthlyStats(prev => {
        const next = { ...prev };
        Object.keys(monthly).forEach(m => {
          if (!next[m]) next[m] = { income: 0, maintenance: 0 };
          next[m].maintenance = monthly[m];
        });
        return next;
      });
    });

    return () => {
      unsubIncome();
      unsubMaint();
    };
  }, [vehicleId]);

  const sortedMonths = Object.keys(monthlyStats).sort().reverse();
  const chartData = sortedMonths.map(month => ({
    name: month,
    income: monthlyStats[month].income || 0,
    maintenance: monthlyStats[month].maintenance || 0
  })).reverse();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
          <p className="text-emerald-600 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1">{t.totalIncome}</p>
          <p className="text-2xl lg:text-3xl font-black text-emerald-700">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl">
          <p className="text-rose-600 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1">{t.totalMaintenance}</p>
          <p className="text-2xl lg:text-3xl font-black text-rose-700">৳{totalMaintenance.toLocaleString()}</p>
        </div>
      </div>

      {sortedMonths.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-3xl border border-gray-100">
             <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart2 className="text-blue-500" size={16} />
                {t.profitAnalysis}
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} 
                    />
                    <Bar name={lang === 'bn' ? "ইনকাম" : "Income"} dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar name={lang === 'bn' ? "ব্যয়" : "Cost"} dataKey="maintenance" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-3xl border border-gray-100 h-fit lg:max-h-[350px] overflow-hidden flex flex-col">
             <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="text-blue-500" size={16} />
                {t.monthlyBreakdown}
             </h3>
             <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {sortedMonths.map(month => (
                  <div key={month} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 grow">
                     <span className="text-[10px] lg:text-xs font-bold text-gray-500">{month}</span>
                     <div className="flex gap-2 lg:gap-4">
                        <div className="text-right">
                           <p className="text-xs font-bold text-emerald-600">৳{(monthlyStats[month].income || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-rose-600">৳{(monthlyStats[month].maintenance || 0).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleLogSection({ title, icon, vehicleId, collectionName, fields, lang }: { title: string, icon: React.ReactNode, vehicleId: string, collectionName: string, fields: any[], lang: Language }) {
  const t = translations[lang];
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState<any>({});
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, collectionName), where('vehicleId', '==', vehicleId), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, collectionName));
    return () => unsubscribe();
  }, [vehicleId, collectionName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, collectionName), {
        ...newData,
        vehicleId,
        cost: newData.cost ? Number(newData.cost) : 0,
        amount: newData.amount ? Number(newData.amount) : 0,
        createdAt: serverTimestamp()
      });
      setNewData({ date: new Date().toISOString().split('T')[0] });
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionName);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, collectionName);
    }
  };

  const filteredLogs = logs.filter(log => 
    Object.values(log).some(val => 
      String(val).toLowerCase().includes(localSearch.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 gap-4">
        <div className="flex items-center gap-2">
           <span className="text-blue-500">{icon}</span>
           <h3 className="font-bold text-ink text-sm lg:text-base">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder={t.search}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button 
            onClick={() => {
              setShowAdd(!showAdd);
              if (!showAdd) setNewData({ date: new Date().toISOString().split('T')[0] });
            }}
            className={`p-2 rounded-xl transition-all ${showAdd ? 'bg-rose-50 text-rose-500 rotate-45' : 'bg-blue-50 text-blue-500'}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="p-4 lg:p-6 bg-blue-50/30 border-b border-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {fields.map(f => (
              <div key={f.name} className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{f.label}</label>
                <input 
                  required
                  type={f.type} 
                  value={newData[f.name] || ''} 
                  onChange={e => setNewData({...newData, [f.name]: e.target.value})} 
                  className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            ))}
            <div className="flex items-end lg:col-span-1">
               <button className="w-full bg-ink text-white py-2 rounded-xl font-bold text-sm">{t.save}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="max-h-80 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              {fields.map(f => <th key={f.name} className="px-4 lg:px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.label}</th>)}
              <th className="px-4 lg:px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                {fields.map(f => (
                  <td key={f.name} className="px-4 lg:px-6 py-4 text-xs font-bold text-ink">
                    {f.type === 'number' ? `৳${(log[f.name] || 0).toLocaleString()}` : log[f.name]}
                  </td>
                ))}
                <td className="px-4 lg:px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(log.id)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && <p className="text-center text-gray-400 py-10 italic text-sm">{localSearch ? (lang === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No results found') : t.noSalesReport}</p>}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, updateDoc, doc, Timestamp, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit2,
  History, 
  DollarSign,
  Wrench,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Calendar,
  BarChart2,
  Printer,
  FileText,
  ArrowUpRight,
  ArrowDownLeft
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
import ImageUpload from './ui/ImageUpload';
import ConfirmModal from './ui/ConfirmModal';

export default function VehicleManager({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null; type: 'vehicle' | 'log'; collection?: string }>({
    isOpen: false,
    id: null,
    type: 'vehicle'
  });
  const [newVehicle, setNewVehicle] = useState({ 
    vehicleNumber: '', 
    name: '', 
    type: '',
    imageURL: '',
    registrationNumber: '',
    fitnessDate: '',
    insuranceDate: '',
    taxTokenDate: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setVehicles(snap.docs.map(doc => ({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) } as Vehicle)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles'));
    return () => unsubscribe();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber || !newVehicle.name || !newVehicle.type || isSaving || isUploading) {
      if (!newVehicle.vehicleNumber || !newVehicle.name || !newVehicle.type) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে নম্বর, নাম এবং ধরন পূরণ করুন' : 'Please fill number, name and type');
      }
      if (isUploading) {
        alert(lang === 'bn' ? 'অনুগ্রহ করে ছবি আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন' : 'Please wait for image upload to complete');
      }
      return;
    }
    setIsSaving(true);
    try {
      if (editingVehicleId) {
        await updateDoc(doc(db, 'vehicles', editingVehicleId), {
          ...newVehicle,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'vehicles'), {
          ...newVehicle,
          createdAt: serverTimestamp()
        });
      }
      setNewVehicle({ 
        vehicleNumber: '', 
        name: '', 
        type: '',
        imageURL: '',
        registrationNumber: '',
        fitnessDate: '',
        insuranceDate: '',
        taxTokenDate: ''
      });
      setIsAddingVehicle(false);
      setEditingVehicleId(null);
    } catch (err) {
      alert(lang === 'bn' ? 'গাড়ির তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save vehicle.');
      handleFirestoreError(err, editingVehicleId ? OperationType.UPDATE : OperationType.CREATE, 'vehicles');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setNewVehicle({ 
      vehicleNumber: v.vehicleNumber, 
      name: v.name, 
      type: v.type,
      imageURL: v.imageURL || '',
      registrationNumber: v.registrationNumber || '',
      fitnessDate: v.fitnessDate || '',
      insuranceDate: v.insuranceDate || '',
      taxTokenDate: v.taxTokenDate || ''
    });
    setEditingVehicleId(v.id);
    setIsAddingVehicle(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      if (selectedVehicle?.id === id) setSelectedVehicle(null);
    } catch (err) {
      console.error("Vehicle Delete Error:", err);
      alert(lang === 'bn' ? 'গাড়ি মুছতে সমস্যা হয়েছে। দয়া করে এডমিন এক্সেস আছে কি না নিশ্চিত করুন।' : 'Failed to delete vehicle. Please ensure you have admin access.');
      handleFirestoreError(err, OperationType.DELETE, 'vehicles');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    (v.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      {/* Sidebar List */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 ${selectedVehicle ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink dark:text-white">{t.vehicleList}</h2>
          <button 
            onClick={() => setIsAddingVehicle(true)}
            className="p-2 bg-ink dark:bg-blue-600 text-white rounded-xl shadow-lg transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" size={18} />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? "গাড়ি খুঁজুন..." : "Search vehicles..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm dark:text-white"
          />
        </div>

        {/* Mobile Horizontal Selector when a vehicle is selected */}
        {selectedVehicle && (
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {filteredVehicles.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  selectedVehicle.id === v.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-dark-surface text-gray-500 dark:text-dark-muted border-gray-100 dark:border-dark-border'
                }`}
              >
                {v.vehicleNumber}
              </button>
            ))}
          </div>
        )}

        <div className={`space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] pb-4 ${selectedVehicle ? 'hidden lg:block' : 'block'}`}>
          {filteredVehicles.map(v => (
            <motion.div
              layout
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                selectedVehicle?.id === v.id 
                  ? 'bg-ink dark:bg-blue-600 text-white border-ink dark:border-blue-500 shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/20' 
                  : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-dark-border hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`px-2 py-1 ${selectedVehicle?.id === v.id ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'} rounded text-[10px] font-black uppercase tracking-tighter`}>
                  {v.vehicleNumber}
                </div>
                <div className="flex items-center gap-3 sm:gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditVehicle(v); }}
                    className={`${selectedVehicle?.id === v.id ? 'text-white/50 hover:text-white' : 'text-gray-300 dark:text-dark-muted hover:text-blue-500'}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setConfirmModal({ isOpen: true, id: v.id, type: 'vehicle' });
                    }}
                    className={`relative z-10 p-2.5 -m-1 rounded-xl transition-all ${selectedVehicle?.id === v.id ? 'text-white/50 hover:text-white' : 'text-gray-300 dark:text-dark-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-bold dark:text-white">{v.name}</p>
              <p className={`text-xs ${selectedVehicle?.id === v.id ? 'text-white/60' : 'text-gray-400 dark:text-dark-muted'}`}>{v.type}</p>
            </motion.div>
          ))}
          {vehicles.length === 0 && <p className="text-center text-gray-400 dark:text-dark-muted py-10 italic text-sm">{t.noVehicle}</p>}
        </div>
      </div>

      {/* Details View */}
      <div className={`flex-1 h-full overflow-y-auto pr-0 lg:pr-4 ${!selectedVehicle ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
        {!selectedVehicle ? (
          <div className="text-center">
            <Truck className="w-16 h-16 text-gray-100 dark:text-dark-surface mx-auto mb-4" />
            <p className="text-gray-400 dark:text-dark-muted font-medium">{t.selectVehicle}</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8 pb-10">
            <div className="bg-white dark:bg-dark-surface p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-dark-border flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
               {/* Printable Vehicle Report (Hidden in UI, Visible in Print) */}
               <div className="hidden print:block fixed inset-0 z-[9999] bg-white w-full h-full p-0 m-0">
                  <div className="printable-document px-12 py-16">
                    <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-10">
                      <div>
                        <h2 className="text-2xl font-black uppercase text-blue-600">{t.miladWater}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.anikaTransport}</p>
                        <p className="text-xs mt-2 text-gray-500">{t.address}</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{lang === 'bn' ? 'যানবাহন রিপোর্ট' : 'Vehicle Report'}</h1>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 inline-block">
                          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            {lang === 'bn' ? 'তারিখ' : 'Date'}: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-10 flex gap-10 items-center bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                      <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                        {selectedVehicle.imageURL ? (
                          <img src={selectedVehicle.imageURL} className="w-full h-full object-cover" />
                        ) : (
                          <Truck className="text-gray-200 w-16 h-16" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.vehicleNumber}</p>
                        <h3 className="text-4xl font-black text-ink mb-2">{selectedVehicle.vehicleNumber}</h3>
                        <p className="text-sm font-bold text-gray-500">{selectedVehicle.name} • {selectedVehicle.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-12">
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.regNumber}</p>
                          <p className="text-xs font-black">{selectedVehicle.registrationNumber || 'N/A'}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t.fitnessDate}</p>
                          <p className="text-xs font-black">{selectedVehicle.fitnessDate || 'N/A'}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{t.insuranceDate}</p>
                          <p className="text-xs font-black">{selectedVehicle.insuranceDate || 'N/A'}</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1">{t.taxToken}</p>
                          <p className="text-xs font-black">{selectedVehicle.taxTokenDate || 'N/A'}</p>
                       </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 gap-12">
                      <div className="text-center">
                        <div className="mb-4 h-12 flex items-center justify-center">
                          <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-200"></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver/Staff Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="mb-4 h-12 flex items-center justify-center">
                          <div className="w-full max-w-[150px] border-b-2 border-dashed border-gray-200"></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager Signature</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-10 -mt-10 opacity-50" />
               
               <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gray-50 dark:bg-dark-bg border-2 border-gray-100 dark:border-dark-border overflow-hidden flex items-center justify-center shrink-0">
                  {selectedVehicle.imageURL ? (
                    <img src={selectedVehicle.imageURL} className="w-full h-full object-cover" alt={selectedVehicle.name} />
                  ) : (
                    <Truck className="text-gray-200 dark:text-dark-muted w-12 h-12" />
                  )}
               </div>

               <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedVehicle(null)}
                        className="lg:hidden p-2 text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg rounded-full"
                      >
                        <ChevronRight className="rotate-180" size={20} />
                      </button>
                      <h1 className="text-2xl lg:text-3xl font-black text-ink dark:text-white">{selectedVehicle.vehicleNumber}</h1>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="p-3 bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl border border-gray-100 dark:border-dark-border transition-all active:scale-95"
                    >
                      <Printer size={20} />
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-dark-muted text-sm lg:text-base font-bold mb-4">{selectedVehicle.name} • {selectedVehicle.type}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="p-2 px-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.regNumber}</p>
                        <p className="text-[10px] font-black dark:text-white truncate">{selectedVehicle.registrationNumber || 'N/A'}</p>
                     </div>
                     <div className="p-2 px-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-emerald-500">{t.fitnessDate}</p>
                        <p className="text-[10px] font-black dark:text-white truncate">{selectedVehicle.fitnessDate || 'N/A'}</p>
                     </div>
                     <div className="p-2 px-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-blue-500">{t.insuranceDate}</p>
                        <p className="text-[10px] font-black dark:text-white truncate">{selectedVehicle.insuranceDate || 'N/A'}</p>
                     </div>
                     <div className="p-2 px-3 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-orange-500">{t.taxToken}</p>
                        <p className="text-[10px] font-black dark:text-white truncate">{selectedVehicle.taxTokenDate || 'N/A'}</p>
                     </div>
                  </div>
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
                  noDataMessage={t.noMaintenanceRecord}
                  fields={[
                    { name: 'date', label: t.date, type: 'date' },
                    { name: 'mechanicName', label: t.mechanic, type: 'text' },
                    { name: 'description', label: t.description, type: 'text' },
                    { name: 'sparePartsCost', label: t.spareParts, type: 'number' },
                    { name: 'cost', label: t.total, type: 'number' },
                    { name: 'nextServiceDate', label: t.nextService, type: 'date' }
                  ]}
               />
               <VehicleLogSection 
                  title={t.dailyIncome} 
                  icon={<History size={18} />} 
                  vehicleId={selectedVehicle.id} 
                  collectionName="vehicle_income"
                  lang={lang}
                  noDataMessage={t.noIncomeRecord}
                  fields={[
                    { name: 'date', label: t.date, type: 'date' },
                    { name: 'driverName', label: t.driverName, type: 'text' },
                    { name: 'routeDetails', label: t.route, type: 'text' },
                    { name: 'amount', label: t.amount, type: 'number' }
                  ]}
               />
            </div>

            <VehicleUnifiedHistory vehicleId={selectedVehicle.id} lang={lang} />
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isAddingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-surface rounded-3xl sm:rounded-[40px] p-5 sm:p-8 lg:p-10 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-dark-border max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => {
                  setIsAddingVehicle(false);
                  setEditingVehicleId(null);
                  setNewVehicle({ vehicleNumber: '', name: '', type: '', imageURL: '', registrationNumber: '', fitnessDate: '', insuranceDate: '', taxTokenDate: '' });
                }}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-400 dark:text-dark-muted hover:text-ink dark:hover:text-white bg-gray-50 dark:bg-dark-bg p-2 rounded-full z-10"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-4 sm:mb-8 dark:text-white shrink-0 px-1">
                {editingVehicleId ? t.editVehicle : t.addVehicle}
              </h2>
              <form onSubmit={handleAddVehicle} className="space-y-3 sm:space-y-4 overflow-y-auto px-1 custom-scrollbar flex-1 pb-4">
                  <ImageUpload 
                    label="Vehicle Photo"
                    currentImageUrl={newVehicle.imageURL}
                    onUploadStart={() => setIsUploading(true)}
                    onUploadComplete={(url) => {
                      setNewVehicle({...newVehicle, imageURL: url});
                      setIsUploading(false);
                    }}
                    onRemove={() => setNewVehicle({...newVehicle, imageURL: ''})}
                    folder="vehicles"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 col-span-1 md:col-span-2">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.vehicleNumber}</label>
                       <input 
                         required
                         type="text" 
                         value={newVehicle.vehicleNumber} 
                         onChange={e => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white text-sm"
                         placeholder="e.g. D-123"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.vehicleName}</label>
                       <input 
                         required
                         type="text" 
                         value={newVehicle.name} 
                         onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white text-sm"
                         placeholder="e.g. Pickup"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.vehicleType}</label>
                       <input 
                         required
                         type="text" 
                         value={newVehicle.type} 
                         onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white text-sm"
                         placeholder="e.g. Mini Truck"
                       />
                    </div>
                    <div className="space-y-1 col-span-2">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.regNumber}</label>
                       <input 
                         type="text" 
                         value={newVehicle.registrationNumber} 
                         onChange={e => setNewVehicle({...newVehicle, registrationNumber: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.fitnessDate}</label>
                       <input 
                         type="date" 
                         value={newVehicle.fitnessDate} 
                         onChange={e => setNewVehicle({...newVehicle, fitnessDate: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.insuranceDate}</label>
                       <input 
                         type="date" 
                         value={newVehicle.insuranceDate} 
                         onChange={e => setNewVehicle({...newVehicle, insuranceDate: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-[0.2em] ml-1">{t.taxToken}</label>
                       <input 
                         type="date" 
                         value={newVehicle.taxTokenDate} 
                         onChange={e => setNewVehicle({...newVehicle, taxTokenDate: e.target.value})} 
                         className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white text-sm"
                       />
                    </div>
                 </div>
                 <button 
                   disabled={isSaving}
                   className="w-full bg-ink dark:bg-blue-600 text-white py-4 rounded-xl font-bold mt-2 hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 sticky bottom-0 text-sm"
                 >
                   {isSaving ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : (editingVehicleId ? t.update : t.save)}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen && confirmModal.type === 'vehicle'}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => confirmModal.id && handleDeleteVehicle(confirmModal.id)}
        title={t.deleteVehicleConfirm}
        message={lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই গাড়িটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this vehicle?'}
        confirmText={t.delete}
        cancelText={t.close}
      />
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
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl">
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1">{t.totalIncome}</p>
          <p className="text-2xl lg:text-3xl font-black text-emerald-700 dark:text-emerald-300">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-3xl">
          <p className="text-rose-600 dark:text-rose-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1">{t.totalMaintenance}</p>
          <p className="text-2xl lg:text-3xl font-black text-rose-700 dark:text-rose-300">৳{totalMaintenance.toLocaleString()}</p>
        </div>
      </div>

      {sortedMonths.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-4 lg:p-6 rounded-3xl border border-gray-100 dark:border-dark-border">
             <h3 className="text-sm font-bold text-ink dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart2 className="text-blue-500 dark:text-blue-400" size={16} />
                {t.profitAnalysis}
             </h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeights: 'bold', color: '#94a3b8' }} 
                    />
                    <Bar name={lang === 'bn' ? "ইনকাম" : "Income"} dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar name={lang === 'bn' ? "ব্যয়" : "Cost"} dataKey="maintenance" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white dark:bg-dark-surface p-4 lg:p-6 rounded-3xl border border-gray-100 dark:border-dark-border h-fit lg:max-h-[350px] overflow-hidden flex flex-col">
             <h3 className="text-sm font-bold text-ink dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="text-blue-500 dark:text-blue-400" size={16} />
                {t.monthlyBreakdown}
             </h3>
             <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {sortedMonths.map(month => (
                  <div key={month} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-border last:border-0 grow">
                     <span className="text-[10px] lg:text-xs font-bold text-gray-500 dark:text-dark-muted">{month}</span>
                     <div className="flex gap-2 lg:gap-4">
                        <div className="text-right">
                           <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">৳{(monthlyStats[month].income || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-rose-600 dark:text-rose-400">৳{(monthlyStats[month].maintenance || 0).toLocaleString()}</p>
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

function VehicleLogSection({ title, icon, vehicleId, collectionName, fields, lang, noDataMessage }: { title: string, icon: React.ReactNode, vehicleId: string, collectionName: string, fields: any[], lang: Language, noDataMessage?: string }) {
  const t = translations[lang];
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState<any>({});
  const [localSearch, setLocalSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    // Simplified query to avoid composite index requirements
    const q = query(collection(db, collectionName), where('vehicleId', '==', vehicleId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort in memory
      data.sort((a, b) => {
        const dateCompare = (b.date || "").localeCompare(a.date || "");
        if (dateCompare !== 0) return dateCompare;
        const aTime = (a.createdAt as any)?.toMillis?.() || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setLogs(data);
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
      alert(lang === 'bn' ? 'তথ্যাদি সেভ করতে সমস্যা হয়েছে।' : 'Failed to save record.');
      handleFirestoreError(err, OperationType.CREATE, collectionName);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      alert(lang === 'bn' ? 'মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete record.');
      handleFirestoreError(err, OperationType.DELETE, collectionName);
    }
  };

  const filteredLogs = logs.filter(log => 
    Object.values(log).some(val => 
      String(val).toLowerCase().includes(localSearch.toLowerCase())
    )
  );

  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-50 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/30 dark:bg-dark-bg/30 gap-4">
        <div className="flex items-center gap-2">
           <span className="text-blue-500 dark:text-blue-400">{icon}</span>
           <h3 className="font-bold text-ink dark:text-white text-sm lg:text-base">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" size={14} />
            <input 
              type="text" 
              placeholder={t.search}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
          </div>
          <button 
            onClick={() => {
              setShowAdd(!showAdd);
              if (!showAdd) setNewData({ date: new Date().toISOString().split('T')[0] });
            }}
            className={`p-2 rounded-xl transition-all ${showAdd ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500'}`}
          >
            {showAdd ? <X size={18} /> : <Plus size={18} />}
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
            className="p-4 lg:p-6 bg-blue-50/30 dark:bg-blue-900/10 border-b border-gray-50 dark:border-dark-border grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4"
          >
            {fields.map(f => (
              <div key={f.name} className={`space-y-1 ${f.name === 'description' || f.name === 'routeDetails' ? 'col-span-2 lg:col-span-1' : 'col-span-1'}`}>
                <label className="text-[10px] font-bold text-gray-500 dark:text-dark-muted uppercase tracking-widest block truncate">{f.label}</label>
                <input 
                   required
                   type={f.type} 
                   value={newData[f.name] || ''} 
                   onChange={e => setNewData({...newData, [f.name]: e.target.value})} 
                   className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 text-xs sm:text-sm dark:text-white"
                />
              </div>
            ))}
            <div className="flex items-end col-span-2 lg:col-span-1">
               <button className="w-full bg-ink dark:bg-blue-600 text-white py-2 lg:py-3 rounded-xl font-bold text-xs lg:text-sm shadow-lg shadow-blue-500/20">{t.save}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="max-h-80 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-dark-bg/50">
            <tr>
              {fields.map(f => <th key={f.name} className="px-4 lg:px-6 py-3 text-[10px] font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{f.label}</th>)}
              <th className="px-4 lg:px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                {fields.map(f => (
                  <td key={f.name} className="px-4 lg:px-6 py-4 text-xs font-bold text-ink dark:text-dark-text">
                    {f.type === 'number' ? `৳${(log[f.name] || 0).toLocaleString()}` : log[f.name]}
                  </td>
                ))}
                <td className="px-4 lg:px-6 py-4 text-right">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: log.id }); }}
                    className="text-gray-300 dark:text-dark-muted hover:text-red-500 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && <p className="text-center text-gray-400 dark:text-dark-muted py-10 italic text-sm">{localSearch ? (lang === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No results found') : (noDataMessage || t.noSalesReport)}</p>}
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => confirmModal.id && handleDelete(confirmModal.id)}
        title={t.confirmDelete}
        message={lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this record?'}
        confirmText={t.delete}
        cancelText={t.close}
      />
    </div>
  );
}

function VehicleUnifiedHistory({ vehicleId, lang }: { vehicleId: string, lang: Language }) {
  const t = translations[lang];
  const [history, setHistory] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    // Subscribe to both collections
    const qIncome = query(collection(db, 'vehicle_income'), where('vehicleId', '==', vehicleId));
    const qMaint = query(collection(db, 'maintenance'), where('vehicleId', '==', vehicleId));

    let incomeData: any[] = [];
    let maintData: any[] = [];

    const handleSync = () => {
      const combined = [
        ...incomeData.map(d => ({ ...d, type: 'income', displayType: (lang === 'bn' ? ' আয়' : 'Income'), icon: <ArrowUpRight className="text-emerald-500" size={16} /> })),
        ...maintData.map(d => ({ ...d, type: 'maintenance', displayType: (lang === 'bn' ? ' ব্যয়' : 'Cost'), icon: <ArrowDownLeft className="text-rose-500" size={16} /> }))
      ];

      // Sort by date
      combined.sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        return sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
      });

      setHistory(combined);
      setLoading(false);
    };

    const unsubIncome = onSnapshot(qIncome, (snap) => {
      incomeData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      handleSync();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vehicle_income'));

    const unsubMaint = onSnapshot(qMaint, (snap) => {
      maintData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      handleSync();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'maintenance'));

    return () => {
      unsubIncome();
      unsubMaint();
    };
  }, [vehicleId, sortOrder, lang]);

  const filteredHistory = history.filter(item => 
    (item.description || item.routeDetails || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.driverName || item.mechanicName || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.date || '').includes(search)
  );

  return (
    <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-ink dark:text-white uppercase tracking-tight flex items-center gap-3">
             <History className="text-blue-500" size={24} />
             {t.fullHistory}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.allTime}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 dark:text-white"
            />
          </div>
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-dark-muted rounded-xl text-xs font-bold border border-gray-100 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border transition-all"
          >
            <Calendar size={14} />
            {sortOrder === 'desc' ? (lang === 'bn' ? 'নতুন আগে' : 'Newest First') : (lang === 'bn' ? 'পুরানো আগে' : 'Oldest First')}
          </button>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredHistory.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.date}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.transactionType}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest">{t.description}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest">{lang === 'bn' ? 'সংশ্লিষ্ট ব্যক্তি' : 'Personnel'}</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filteredHistory.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/50 dark:hover:bg-blue-900/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-600 dark:text-dark-muted">{item.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       {item.icon}
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                         item.type === 'income' 
                           ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                           : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                       }`}>
                         {item.displayType}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-ink dark:text-white line-clamp-1">
                      {item.description || item.routeDetails || 'No details'}
                      {item.partsReplaced && <span className="block text-[10px] text-gray-400 mt-1 font-medium italic">Parts: {item.partsReplaced}</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-500 dark:text-dark-muted">
                      {item.mechanicName || item.driverName || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`text-sm font-black font-mono ${
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.type === 'income' ? '+' : '-'} ৳{(item.amount || item.cost || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
            <FileText className="w-12 h-12 text-gray-100 dark:text-dark-surface mb-4" />
            <p className="text-gray-400 dark:text-dark-muted italic text-sm">{search ? (lang === 'bn' ? 'কোন ফলাফল পাওয়া যায়নি' : 'No matching history found') : (lang === 'bn' ? 'কোন লেনদেনের রেকর্ড নেই' : 'No transaction records found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDanger = true 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-dark-surface rounded-[32px] p-6 lg:p-8 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-dark-border"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 dark:text-dark-muted hover:text-ink dark:hover:text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-ink dark:text-white uppercase tracking-tight">{title}</h2>
                <p className="text-gray-500 dark:text-dark-muted text-sm">{message}</p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-dark-muted font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-all text-sm"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3.5 text-white font-bold rounded-2xl transition-all shadow-lg text-sm ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

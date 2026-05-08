import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { Camera, X, Loader2, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  onRemove: () => void;
  currentImageUrl?: string;
  label?: string;
  folder?: string;
}

export default function ImageUpload({ onUploadComplete, onUploadStart, onRemove, currentImageUrl, label, folder = 'uploads' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG, or WEBP)');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setUploading(true);
    if (onUploadStart) onUploadStart();
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
        alert('Upload failed. Please try again.');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadComplete(downloadURL);
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      // Optional: Delete from storage if you want to keep it clean
      // However, for simplicity and safety (as it might be used elsewhere), we just clear the reference in the form first.
      // If we have the full path, we could delete it.
      onRemove();
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">{label}</label>}
      
      <div className="relative">
        {currentImageUrl ? (
          <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
            <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform"
              >
                <Camera size={20} />
              </button>
              <button 
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all ${uploading ? 'pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-sm font-bold text-blue-500">{Math.round(progress)}%</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-2xl text-gray-400">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold dark:text-white">Click to upload photo</p>
                  <p className="text-[10px] text-gray-400 font-medium">JPG, PNG or WEBP (Max 2MB)</p>
                </div>
              </>
            )}
          </div>
        )}
        
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

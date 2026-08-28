'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (fileUrl: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleEvidenceImages = [
    { label: 'Sample Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Garbage', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Drainage', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setFileName(file.name);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelected(null);
  };

  const handleSelectSample = (url: string, label: string) => {
    setPreviewUrl(url);
    setFileName(`${label}.jpg`);
    setError(null);
    onImageSelected(url);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-900/60 hover:bg-slate-800/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
        >
          <div className="p-3 rounded-full bg-slate-800 text-sky-400 group-hover:scale-110 transition-transform mb-3 border border-slate-700">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            Click to upload photo evidence
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG, WEBP up to 5MB (Frontend Mock Preview)
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 group">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="w-full h-56 object-cover rounded-xl"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2 flex items-center justify-between text-xs text-slate-300 font-mono">
            <span className="truncate max-w-[200px]">{fileName}</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Attached
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Sample Selector for Demo */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 block mb-2 font-medium">
          Or pick a sample photo for testing:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sampleEvidenceImages.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample.url, sample.label)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors text-left"
            >
              <img src={sample.url} className="w-6 h-6 rounded object-cover shrink-0" alt="" />
              <span className="truncate text-[11px]">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

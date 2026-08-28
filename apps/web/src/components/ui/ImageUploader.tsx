'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { MediaService, UploadedMediaResponse } from '@/lib/services/mediaService';

export interface ImageAttachment {
  id: string;
  file?: File;
  previewUrl: string;
  mediaId?: string;
  fileName: string;
  size?: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface ImageUploaderProps {
  onMediaChanged?: (mediaIds: string[], mainPreviewUrl: string | null) => void;
  onImageSelected?: (fileUrl: string | null) => void; // Legacy support
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onMediaChanged,
  onImageSelected,
  maxImages = 4,
}) => {
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleEvidenceImages = [
    { label: 'Sample Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Garbage', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sample Drainage', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80' },
  ];

  const notifyParent = (currentAttachments: ImageAttachment[]) => {
    const successfulMediaIds = currentAttachments
      .filter((a) => a.status === 'success' && a.mediaId)
      .map((a) => a.mediaId!);

    const mainPreview = currentAttachments.length > 0 ? currentAttachments[0].previewUrl : null;

    if (onMediaChanged) {
      onMediaChanged(successfulMediaIds, mainPreview);
    }
    if (onImageSelected) {
      onImageSelected(mainPreview);
    }
  };

  const uploadFileAttachment = async (attachment: ImageAttachment, file: File) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === attachment.id ? { ...a, status: 'uploading', errorMessage: undefined } : a))
    );

    try {
      const uploaded: UploadedMediaResponse = await MediaService.uploadImage(file);

      setAttachments((prev) => {
        const updated = prev.map((a) =>
          a.id === attachment.id
            ? {
                ...a,
                status: 'success' as const,
                mediaId: uploaded.mediaId,
                previewUrl: uploaded.url || a.previewUrl,
              }
            : a
        );
        notifyParent(updated);
        return updated;
      });
    } catch (err: any) {
      setAttachments((prev) => {
        const updated = prev.map((a) =>
          a.id === attachment.id
            ? {
                ...a,
                status: 'error' as const,
                errorMessage: err.message || 'Image upload failed.',
              }
            : a
        );
        notifyParent(updated);
        return updated;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - attachments.length;
    const selectedFiles = files.slice(0, remainingSlots);

    for (const file of selectedFiles) {
      const tempId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      // Client-side quick check
      if (!file.type.startsWith('image/')) {
        const errorAtt: ImageAttachment = {
          id: tempId,
          file,
          previewUrl,
          fileName: file.name,
          size: file.size,
          status: 'error',
          errorMessage: 'Unsupported format. Only JPG, PNG, WEBP allowed.',
        };
        setAttachments((prev) => [...prev, errorAtt]);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        const errorAtt: ImageAttachment = {
          id: tempId,
          file,
          previewUrl,
          fileName: file.name,
          size: file.size,
          status: 'error',
          errorMessage: 'File size exceeds maximum 10MB limit.',
        };
        setAttachments((prev) => [...prev, errorAtt]);
        continue;
      }

      const newAtt: ImageAttachment = {
        id: tempId,
        file,
        previewUrl,
        fileName: file.name,
        size: file.size,
        status: 'uploading',
      };

      setAttachments((prev) => [...prev, newAtt]);
      await uploadFileAttachment(newAtt, file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (target?.mediaId) {
      MediaService.deleteMedia(target.mediaId).catch(() => {});
    }

    setAttachments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      notifyParent(updated);
      return updated;
    });
  };

  const handleRetry = (attachment: ImageAttachment) => {
    if (attachment.file) {
      uploadFileAttachment(attachment, attachment.file);
    }
  };

  const handleSelectSample = async (sampleUrl: string, sampleLabel: string) => {
    if (attachments.length >= maxImages) return;

    const tempId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newAtt: ImageAttachment = {
      id: tempId,
      previewUrl: sampleUrl,
      fileName: `${sampleLabel}.jpg`,
      status: 'uploading',
    };

    setAttachments((prev) => [...prev, newAtt]);
    setIsUploadingGlobal(true);

    try {
      const uploaded = await MediaService.uploadSampleUrl(sampleUrl, sampleLabel);
      setAttachments((prev) => {
        const updated = prev.map((a) =>
          a.id === tempId
            ? {
                ...a,
                status: 'success' as const,
                mediaId: uploaded.mediaId,
                previewUrl: uploaded.url,
              }
            : a
        );
        notifyParent(updated);
        return updated;
      });
    } catch (err: any) {
      setAttachments((prev) => {
        const updated = prev.map((a) =>
          a.id === tempId
            ? {
                ...a,
                status: 'error' as const,
                errorMessage: err.message || 'Sample upload failed.',
              }
            : a
        );
        notifyParent(updated);
        return updated;
      });
    } finally {
      setIsUploadingGlobal(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple={maxImages > 1}
        className="hidden"
      />

      {/* Upload trigger zone */}
      {attachments.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 hover:border-zinc-950 bg-zinc-50 hover:bg-zinc-100 rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
        >
          <div className="p-3 rounded-full bg-zinc-900 text-white group-hover:scale-105 transition-transform mb-3 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900">
            Click or drag to upload photo evidence
          </h4>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            JPG, PNG, WEBP (Server Validated, Max 10MB GridFS) — {attachments.length}/{maxImages} attached
          </p>
        </div>
      )}

      {/* Uploaded / Processing Attachment Cards */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative rounded-lg overflow-hidden border border-zinc-200 bg-white p-2.5 shadow-sm transition-all"
            >
              <div className="relative h-44 w-full bg-zinc-900 rounded overflow-hidden">
                <img
                  src={att.previewUrl}
                  alt={att.fileName}
                  className="w-full h-full object-cover"
                />

                {att.status === 'uploading' && (
                  <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-7 h-7 animate-spin text-white mb-2" />
                    <span className="text-xs font-bold tracking-wide">Processing & Uploading...</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-1">GridFS Binary Storage</span>
                  </div>
                )}

                {att.status === 'error' && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-3 text-center">
                    <AlertCircle className="w-6 h-6 text-rose-400 mb-1" />
                    <span className="text-xs font-bold text-rose-200">Upload Failed</span>
                    <p className="text-[11px] text-rose-300 line-clamp-2 my-1">{att.errorMessage}</p>
                    {att.file && (
                      <button
                        type="button"
                        onClick={() => handleRetry(att)}
                        className="mt-1 px-3 py-1 bg-white text-zinc-950 rounded text-xs font-bold flex items-center gap-1 hover:bg-zinc-200 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-rose-600 transition-colors shadow-md z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono text-zinc-700 px-1">
                <span className="truncate max-w-[180px] font-semibold">{att.fileName}</span>
                {att.status === 'success' && (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                )}
                {att.status === 'uploading' && (
                  <span className="text-zinc-500 font-bold">Uploading...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Sample Selector for Testing */}
      <div className="pt-3 border-t border-zinc-200">
        <span className="text-xs text-zinc-500 block mb-2 font-bold uppercase tracking-wider">
          Quick test samples (uploads live to MongoDB GridFS):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sampleEvidenceImages.map((sample) => (
            <button
              key={sample.label}
              type="button"
              disabled={isUploadingGlobal || attachments.length >= maxImages}
              onClick={() => handleSelectSample(sample.url, sample.label)}
              className="flex items-center gap-2 p-2 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 disabled:opacity-50 text-xs text-zinc-900 transition-colors text-left font-medium"
            >
              <img src={sample.url} className="w-6 h-6 rounded object-cover shrink-0" alt="" />
              <span className="truncate text-[11px] font-bold">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

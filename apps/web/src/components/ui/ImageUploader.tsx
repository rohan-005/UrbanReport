'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const successfulMediaIds = attachments
      .filter((a) => a.status === 'success' && Boolean(a.mediaId))
      .map((a) => a.mediaId!);

    const mainPreview = attachments.length > 0 ? attachments[0].previewUrl : null;

    if (onMediaChanged) {
      onMediaChanged(successfulMediaIds, mainPreview);
    }
    if (onImageSelected) {
      onImageSelected(mainPreview);
    }
  }, [attachments, onMediaChanged, onImageSelected]);

  const uploadFileAttachment = async (attachment: ImageAttachment, file: File) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === attachment.id ? { ...a, status: 'uploading', errorMessage: undefined } : a))
    );

    try {
      const uploaded: UploadedMediaResponse = await MediaService.uploadImage(file);

      setAttachments((prev) =>
        prev.map((a) =>
          a.id === attachment.id
            ? {
                ...a,
                status: 'success' as const,
                mediaId: uploaded.mediaId,
                previewUrl: uploaded.url || a.previewUrl,
              }
            : a
        )
      );
    } catch (err: any) {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === attachment.id
            ? {
                ...a,
                status: 'error' as const,
                errorMessage: err.message || 'Image upload failed.',
              }
            : a
        )
      );
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

    const updated = attachments.filter((a) => a.id !== id);
    setAttachments(updated);
  };

  const handleRetry = (attachment: ImageAttachment) => {
    if (attachment.file) {
      uploadFileAttachment(attachment, attachment.file);
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
          className="border-2 border-dashed border-[#e2dfd7] hover:border-[#89a577] bg-[#f5f3ee] hover:bg-white rounded-md p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
        >
          <div className="p-3 rounded-full bg-[#89a577] text-white group-hover:scale-105 transition-transform mb-3 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#1f241d]">
            Click or drag to upload photo evidence
          </h4>
          <p className="text-xs text-[#6b7280] mt-1 font-mono">
            JPG, PNG, WEBP — {attachments.length}/{maxImages} attached
          </p>
        </div>
      )}

      {/* Uploaded / Processing Attachment Cards */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative rounded-md overflow-hidden border border-[#e2dfd7] bg-white p-2.5 shadow-xs transition-all"
            >
              <div className="relative h-44 w-full bg-[#1f241d] rounded-sm overflow-hidden">
                <img
                  src={att.previewUrl}
                  alt={att.fileName}
                  className="w-full h-full object-cover"
                />

                {att.status === 'uploading' && (
                  <div className="absolute inset-0 bg-[#1f241d]/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-7 h-7 animate-spin text-[#89a577] mb-2" />
                    <span className="text-xs font-bold tracking-wide">Processing & Uploading...</span>
                  </div>
                )}

                {att.status === 'error' && (
                  <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center">
                    <AlertCircle className="w-6 h-6 text-rose-400 mb-1" />
                    <span className="text-xs font-bold text-rose-200">Upload Failed</span>
                    <p className="text-[11px] text-rose-300 line-clamp-2 my-1">{att.errorMessage}</p>
                    {att.file && (
                      <button
                        type="button"
                        onClick={() => handleRetry(att)}
                        className="mt-1 px-3 py-1 bg-white text-[#1f241d] rounded-md text-xs font-bold flex items-center gap-1 hover:bg-[#f5f3ee] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#1f241d]/80 text-white hover:bg-rose-600 transition-colors shadow-md z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono text-[#1f241d] px-1">
                <span className="truncate max-w-[180px] font-semibold">{att.fileName}</span>
                {att.status === 'success' && (
                  <span className="flex items-center gap-1 text-[#4e6d3c] font-bold bg-[#eef6ea] px-2 py-0.5 rounded-full border border-[#a8c38e]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

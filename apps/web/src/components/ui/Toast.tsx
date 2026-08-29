import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#a8c38e] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#d4faff] shrink-0" />,
  };

  const borders = {
    success: 'border-[#a8c38e]/40 bg-[#1f241d]',
    error: 'border-rose-500/40 bg-[#1f241d]',
    info: 'border-[#d4faff]/40 bg-[#1f241d]',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-md border ${borders[toast.type]} shadow-lg text-white min-w-[280px] max-w-md`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-zinc-300 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md"
        aria-label="Dismiss toast notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  height?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  height = 'h-64',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${height} w-full text-slate-400 p-6`}>
      <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

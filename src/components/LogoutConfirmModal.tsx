import React from 'react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  title = 'Yakin keluar?',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-scale-up flex flex-col items-center">
        {/* Blue-Slate Circle Question Mark Icon */}
        <div className="w-24 h-24 rounded-full border-[3.5px] border-[#8097A2] flex items-center justify-center mb-6 bg-white shadow-xs">
          <span className="text-5xl font-normal text-[#8097A2] leading-none select-none font-sans">
            ?
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#374151] tracking-tight mb-8">
          {title}
        </h3>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-[#6552D0] hover:bg-[#5340C0] text-white font-bold text-sm tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            Ya, Keluar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#6C757D] hover:bg-[#5A6268] text-white font-bold text-sm tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

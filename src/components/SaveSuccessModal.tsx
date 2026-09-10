import React from 'react';
import { Check } from 'lucide-react';

interface SaveSuccessModalProps {
  isOpen: boolean;
  message?: string;
  title?: string;
  onClose: () => void;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  isOpen,
  message = '(Simulasi) Absensi disimpan!',
  title = 'Berhasil',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-scale-up flex flex-col items-center">
        {/* Green Circle Checkmark Icon */}
        <div className="w-24 h-24 rounded-full border-[3.5px] border-[#C8E6C9] flex items-center justify-center mb-6 bg-white shadow-xs">
          <Check className="w-12 h-12 text-[#7CB342] stroke-[3.5]" />
        </div>

        {/* Title */}
        <h3 className="text-3xl font-extrabold text-[#374151] tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="text-base font-medium text-[#4B5563] mt-2 mb-7">
          {message}
        </p>

        {/* Purple OK Button */}
        <button
          type="button"
          onClick={onClose}
          className="px-7 py-2.5 bg-[#6552D0] hover:bg-[#5340C0] text-white font-bold text-sm tracking-wide rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
        >
          OK
        </button>
      </div>
    </div>
  );
};

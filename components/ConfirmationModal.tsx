
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, LogOut, Info, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'info';
  requireTextInput?: string;
  textInputPlaceholder?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
  requireTextInput,
  textInputPlaceholder = "Digite aqui para confirmar"
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isInfo = variant === 'info';
  // Adicionado .trim() para robustez na comparação
  const isConfirmDisabled = requireTextInput 
    ? inputValue.trim() !== requireTextInput.trim() 
    : false;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-20 h-20 ${isInfo ? 'bg-indigo-50 text-indigo-500' : 'bg-red-50 text-red-500'} rounded-3xl flex items-center justify-center mb-6 shadow-inner`}>
            {requireTextInput ? <ShieldAlert size={40} /> : isInfo ? <LogOut size={40} /> : <AlertTriangle size={40} />}
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">{title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-6">
            {message}
          </p>

          {requireTextInput && (
            <div className="w-full space-y-3 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left px-1">
                Para confirmar, digite <span className="text-red-500">"{requireTextInput}"</span> abaixo:
              </label>
              <input 
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={textInputPlaceholder}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-red-200 outline-none font-bold text-center transition-all"
              />
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 flex gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || isConfirmDisabled}
            className={`flex-1 px-6 py-4 ${isInfo ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

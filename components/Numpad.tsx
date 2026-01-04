
import React from 'react';

interface NumpadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
  onHint: () => void;
  disabled?: boolean;
  isHintLoading?: boolean;
}

const Numpad: React.FC<NumpadProps> = ({ onNumberClick, onErase, onHint, disabled, isHintLoading }) => {
  return (
    <div className="w-full max-w-md space-y-4 px-4">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            disabled={disabled}
            onClick={() => onNumberClick(num)}
            className="h-14 bg-white rounded-xl shadow-sm border border-slate-200 text-xl font-bold text-slate-700 hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            {num}
          </button>
        ))}
        {[6, 7, 8, 9].map((num) => (
          <button
            key={num}
            disabled={disabled}
            onClick={() => onNumberClick(num)}
            className="h-14 bg-white rounded-xl shadow-sm border border-slate-200 text-xl font-bold text-slate-700 hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          disabled={disabled}
          onClick={onErase}
          className="h-14 bg-slate-100 rounded-xl shadow-sm border border-slate-200 text-xl font-bold text-slate-600 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 transition-colors"
        >
          <i className="fa-solid fa-eraser"></i>
        </button>
      </div>
      
      <button
        disabled={disabled || isHintLoading}
        onClick={onHint}
        className="w-full h-14 bg-indigo-600 rounded-xl shadow-md text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all"
      >
        {isHintLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <i className="fa-solid fa-lightbulb"></i>
        )}
        {isHintLoading ? 'Pensando...' : 'Dica com IA'}
      </button>
    </div>
  );
};

export default Numpad;

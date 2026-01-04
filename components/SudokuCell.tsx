
import React from 'react';
import { Cell } from '../types';

interface SudokuCellProps {
  cell: Cell;
  isSelected: boolean;
  isSameGroup: boolean;
  isSameNumber: boolean;
  onClick: () => void;
  error?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({ 
  cell, 
  isSelected, 
  isSameGroup, 
  isSameNumber,
  onClick,
  error 
}) => {
  const getBgColor = () => {
    if (isSelected) return 'bg-indigo-500 text-white z-10';
    if (isSameNumber && cell.value !== null) return 'bg-indigo-100';
    if (isSameGroup) return 'bg-slate-100';
    return 'bg-white';
  };

  const getBorderClasses = () => {
    let classes = 'border-[0.5px] border-slate-300';
    if (cell.col % 3 === 2 && cell.col !== 8) classes += ' border-r-2 border-r-slate-800';
    if (cell.row % 3 === 2 && cell.row !== 8) classes += ' border-b-2 border-b-slate-800';
    return classes;
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex items-center justify-center aspect-square text-xl md:text-2xl font-medium cursor-pointer transition-all duration-150
        ${getBgColor()}
        ${getBorderClasses()}
        ${cell.fixed ? 'font-bold' : 'font-light text-indigo-600'}
        ${error ? 'bg-red-100 !text-red-600' : ''}
        active:scale-95 select-none
      `}
    >
      {cell.value || ''}
    </div>
  );
};

export default SudokuCell;

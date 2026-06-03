'use client';

import { useState, useEffect } from 'react';
import { beadColors } from '@/data/beadColors';
import { X, ArrowLeft } from 'lucide-react';

interface ColorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (colorCode: string) => void;
  initialColor?: string;
}

const groupColorsByLetter = () => {
  const groups: { [key: string]: typeof beadColors } = {};
  
  beadColors.forEach(color => {
    const letter = color.code.charAt(0);
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(color);
  });
  
  return groups;
};

export default function ColorSelector({ isOpen, onClose, onSelect, initialColor }: ColorSelectorProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const colorGroups = groupColorsByLetter();
  const letters = Object.keys(colorGroups).sort();

  useEffect(() => {
    if (initialColor) {
      const letter = initialColor.charAt(0);
      if (colorGroups[letter]) {
        setSelectedLetter(letter);
      }
    }
  }, [isOpen, initialColor]);

  const getDisplayColors = () => {
    return colorGroups[selectedLetter] || [];
  };

  if (!isOpen) return null;

  const displayColors = getDisplayColors();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* 底部弹出框 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-slide-up">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">选择色号</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* 字母导航 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-5 py-2 rounded-xl font-medium transition-all flex-shrink-0 ${
                  selectedLetter === letter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* 色号列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {displayColors.map(color => (
              <button
                key={color.code}
                onClick={() => {
                  onSelect(color.code);
                  onClose();
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  initialColor === color.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-300'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-left">
                  <p className="font-bold text-gray-800">{color.code}</p>
                  <p className="text-sm text-gray-500 truncate">{color.name}</p>
                </div>
              </button>
            ))}
          </div>

          {displayColors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <p className="text-lg">没有找到匹配的色号</p>
              <p className="text-sm mt-1">尝试其他字母分组</p>
            </div>
          )}
        </div>

        {/* 底部安全间距 */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InventoryItem } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { Plus, Minus, Search, CheckSquare, Square, Check, Edit3 } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', beadColors.map(color => ({
    colorCode: color.code,
    quantity: 0
  })));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(100);

  const filteredColors = beadColors.filter(color => {
    const matchesSearch = color.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         color.name.toLowerCase().includes(searchQuery.toLowerCase());
    const item = inventory.find(i => i.colorCode === color.code);
    const matchesLowStock = !filterLowStock || (item && item.quantity < 10);
    return matchesSearch && matchesLowStock;
  });

  const updateQuantity = (colorCode: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.colorCode === colorCode) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }));
  };

  const setQuantity = (colorCode: string, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.colorCode === colorCode) {
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    }));
  };

  const toggleSelectColor = (colorCode: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorCode)) {
        return prev.filter(c => c !== colorCode);
      } else {
        return [...prev, colorCode];
      }
    });
  };

  const selectAll = () => {
    setSelectedColors(filteredColors.map(c => c.code));
  };

  const deselectAll = () => {
    setSelectedColors([]);
  };

  const batchUpdateQuantity = (delta: number) => {
    setInventory(prev => prev.map(item => {
      if (selectedColors.includes(item.colorCode)) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }));
  };

  const batchAddQuantity = () => {
    if (batchQuantity > 0) {
      batchUpdateQuantity(batchQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">库存管理</h1>
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              if (selectMode) deselectAll();
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Edit3 size={20} className="inline mr-1" />
            {selectMode ? '完成' : '选择'}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索色号或颜色名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              filterLowStock
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {filterLowStock ? '显示全部' : '只看库存不足'}
          </button>
          {selectMode && (
            <>
              {selectedColors.length > 0 ? (
                <button
                  onClick={deselectAll}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  取消
                </button>
              ) : (
                <button
                  onClick={selectAll}
                  className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium"
                >
                  全选
                </button>
              )}
            </>
          )}
        </div>

        {selectMode && selectedColors.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">已选择 {selectedColors.length} 个色号</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-center"
                placeholder="输入补充数量"
              />
              <button
                onClick={batchAddQuantity}
                disabled={batchQuantity <= 0}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={20} />
                批量补充
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => batchUpdateQuantity(-10)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Minus size={20} />
                减10
              </button>
              <button
                onClick={() => batchUpdateQuantity(10)}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                加10
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {filteredColors.map(color => {
            const item = inventory.find(i => i.colorCode === color.code);
            const quantity = item?.quantity || 0;
            const isLowStock = quantity < 10;
            const isSelected = selectedColors.includes(color.code);

            return (
              <div
                key={color.code}
                className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm transition-all ${
                  isLowStock ? 'border-2 border-yellow-300' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                {selectMode && (
                  <button
                    onClick={() => toggleSelectColor(color.code)}
                    className="flex-shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={24} className="text-blue-500" />
                    ) : (
                      <Square size={24} className="text-gray-300" />
                    )}
                  </button>
                )}
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{color.code}</span>
                    {isLowStock && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        不足
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{color.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(color.code, -10)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(color.code, parseInt(e.target.value) || 0)}
                    className="w-16 h-10 text-center border border-gray-200 rounded-lg"
                  />
                  <button
                    onClick={() => updateQuantity(color.code, 10)}
                    className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

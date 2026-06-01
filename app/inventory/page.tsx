'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { InventoryItem } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { Plus, Minus, Search } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('inventory', beadColors.map(color => ({
    colorCode: color.code,
    quantity: 0
  })));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">库存管理</h1>
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

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            filterLowStock
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {filterLowStock ? '显示全部' : '只看库存不足'}
        </button>

        <div className="grid grid-cols-1 gap-3">
          {filteredColors.map(color => {
            const item = inventory.find(i => i.colorCode === color.code);
            const quantity = item?.quantity || 0;
            const isLowStock = quantity < 10;

            return (
              <div
                key={color.code}
                className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm ${
                  isLowStock ? 'border-2 border-yellow-300' : ''
                }`}
              >
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
